import { useUserStoreHook } from "@/store/modules/user"
import type * as Chat from "./types"

const chat_url = import.meta.env.VITE_CHAT_API
const chat_token = import.meta.env.VITE_CHAT_TOKEN

/** 发送对话消息（blocking 模式） */
export async function sendChatMessageApi(data: Chat.SendChatMessageRequestData) {
  const userStore = useUserStoreHook()
  const userId = userStore.userId?.toString() || ""
  
  const response = await fetch(`${chat_url}/v1/chat-messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${chat_token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      inputs: data.inputs || {},
      query: data.query,
      response_mode: "blocking",
      conversation_id: data.conversation_id || "",
      user: data.user || userId,
      ...(data.files && { files: data.files })
    })
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json() as Promise<Chat.ChatMessageResponseData>
}

/** 发送对话消息（streaming 模式）
 * @param data 请求参数
 * @param onMessage 收到消息块时的回调
 * @param onEnd 消息结束时的回调
 * @param onError 发生错误时的回调
 * @returns 返回 AbortController 用于取消请求
 */
export function sendChatMessageStreamApi(
  data: Chat.SendChatMessageRequestData,
  callbacks: {
    onMessage?: (chunk: Chat.ChatStreamChunk) => void
    onAgentThought?: (chunk: Chat.ChatStreamChunk) => void
    onEnd?: (conversationId: string) => void
    onError?: (error: string) => void
  }
) {
  const abortController = new AbortController()
  const userStore = useUserStoreHook()
  const userId = userStore.userId?.toString() || ""

  fetch(`${chat_url}/v1/chat-messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${chat_token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      inputs: data.inputs || {},
      query: data.query,
      response_mode: "streaming",
      conversation_id: data.conversation_id || "",
      user: data.user || userId,
      ...(data.files && { files: data.files })
    }),
    signal: abortController.signal
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error("Response body is null")
      }

      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          break
        }

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim()
            if (data === "[DONE]") {
              continue
            }

            try {
              const chunk: Chat.ChatStreamChunk = JSON.parse(data)

              if ((chunk.event === "message" || chunk.event === "agent_message") && callbacks.onMessage) {
                callbacks.onMessage(chunk)
              } else if (chunk.event === "agent_thought" && callbacks.onAgentThought) {
                callbacks.onAgentThought(chunk)
              } else if (chunk.event === "message_end" && callbacks.onEnd) {
                callbacks.onEnd(chunk.conversation_id || "")
              } else if (chunk.event === "error" && callbacks.onError) {
                callbacks.onError(chunk.error || "Unknown error")
              }
            } catch (e) {
              console.error("Failed to parse SSE data:", e)
            }
          }
        }
      }
    })
    .catch((error) => {
      if (error.name === "AbortError") {
        console.log("Request aborted")
      } else if (callbacks.onError) {
        callbacks.onError(error.message)
      }
    })

  return abortController
}

/** 获取会话列表 */
export async function getConversationsApi(data?: Chat.GetConversationsRequestData) {
  const userStore = useUserStoreHook()
  const userId = userStore.userId?.toString() || ""
  
  const params = new URLSearchParams({
    user: data?.user || userId,
    limit: (data?.limit || 20).toString(),
    sort_by: data?.sort_by || "-updated_at"
  })
  
  if (data?.last_id) {
    params.append("last_id", data.last_id)
  }
  
  const response = await fetch(`${chat_url}/v1/conversations?${params.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${chat_token}`
    }
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json() as Promise<Chat.GetConversationsResponseData>
}

/** 获取会话历史消息列表 */
export async function getConversationMessagesApi(data: Chat.GetMessagesRequestData) {
  const userStore = useUserStoreHook()
  const userId = userStore.userId?.toString() || ""
  
  const params = new URLSearchParams({
    conversation_id: data.conversation_id,
    user: data.user || userId,
    limit: (data.limit || 20).toString()
  })
  
  if (data.first_id) {
    params.append("first_id", data.first_id)
  }
  
  const response = await fetch(`${chat_url}/v1/messages?${params.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${chat_token}`
    }
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json() as Promise<Chat.GetMessagesResponseData>
}

/** 删除会话 */
export async function deleteConversationApi(data: Chat.DeleteConversationRequestData) {
  const response = await fetch(`${chat_url}/v1/conversations/${data.conversation_id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${chat_token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      user: data.user
    })
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  // 204响应没有内容，直接返回成功
  return { success: true }
}

/** 重命名会话 */
export async function renameConversationApi(data: Chat.RenameConversationRequestData) {
  const response = await fetch(`${chat_url}/v1/conversations/${data.conversation_id}/name`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${chat_token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      user: data.user,
      ...(data.name !== undefined && { name: data.name }),
      ...(data.auto_generate !== undefined && { auto_generate: data.auto_generate })
    })
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json() as Promise<Chat.RenameConversationResponseData>
}
