<template>
  <div class="flex h-100vh w-full overflow-hidden relative">
    <!-- 桌面端：直接显示侧边栏 -->
    <ChatSidebar v-if="!isMobile" @new-chat="handleNewChat" />

    <!-- 移动端：侧边栏 + 遮罩 -->
    <template v-else>
      <!-- 遮罩层 -->
      <transition name="fade">
        <div v-if="sidebarVisible" class="fixed inset-0 bg-black bg-opacity-50 z-999" @click="sidebarVisible = false" />
      </transition>

      <!-- 侧边栏（绝对定位） -->
      <transition name="slide">
        <div v-if="sidebarVisible" class="fixed left-0 top-0 h-full z-1000 shadow-lg">
          <ChatSidebar :is-mobile="true" @new-chat="handleNewChatAndCloseSidebar" />
        </div>
      </transition>

      <!-- 移动端菜单按钮（始终显示，但仅在侧边栏关闭时可见） -->
      <transition name="fade">
        <div
          v-if="!sidebarVisible"
          class="fixed top-16px left-16px z-100 w-40px h-40px flex items-center justify-center bg-white rounded-full shadow-md cursor-pointer hover:shadow-lg transition-shadow"
          @click="sidebarVisible = true"
        >
          <el-icon :size="20">
            <Expand />
          </el-icon>
        </div>
      </transition>
    </template>

    <ChatMain :messages="messages" :is-loading="isLoading" @send="handleSendMessage" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { Expand } from "@element-plus/icons-vue"
import { useDevice } from "@/hooks/useDevice"
import ChatSidebar from "./components/ChatSidebar.vue"
import ChatMain from "./components/ChatMain.vue"
import useResize from "@/layouts/hooks/useResize"
import { sendChatMessageStreamApi } from "@/api/chat"
import type { ChatStreamChunk } from "@/api/chat/types"

useResize()

const { isMobile } = useDevice()
const sidebarVisible = ref(false)

/** 消息接口 */
interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  /** 是否正在流式接收中 */
  isStreaming?: boolean
  /** Agent思考过程（可选） */
  agentThoughts?: AgentThought[]
}

/** Agent思考过程 */
interface AgentThought {
  id: string
  position: number
  thought: string
  observation: string
  tool: string
  tool_input: string
  created_at: number
}

const messages = ref<Message[]>([])
const currentConversationId = ref("")
const isLoading = ref(false)
let currentAbortController: AbortController | null = null

// 调试信息
console.log("isMobile:", isMobile.value)

const handleNewChat = () => {
  console.log("新建对话")
  messages.value = []
  currentConversationId.value = ""
  // 如果有正在进行的请求，取消它
  if (currentAbortController) {
    currentAbortController.abort()
    currentAbortController = null
  }
  isLoading.value = false
}

const handleNewChatAndCloseSidebar = () => {
  handleNewChat()
  if (isMobile.value) {
    sidebarVisible.value = false
  }
}

const handleSendMessage = (message: string) => {
  console.log("发送消息:", message)

  // 添加用户消息
  const userMessage: Message = {
    id: `user-${Date.now()}`,
    role: "user",
    content: message,
    timestamp: Date.now()
  }
  messages.value.push(userMessage)

  // 创建一个空的助手消息，用于流式填充
  const assistantMessage: Message = {
    id: `assistant-${Date.now()}`,
    role: "assistant",
    content: "",
    timestamp: Date.now(),
    isStreaming: true // 标记为流式接收中
  }
  messages.value.push(assistantMessage)

  isLoading.value = true

  // 调用流式 API
  currentAbortController = sendChatMessageStreamApi(
    {
      query: message,
      conversation_id: currentConversationId.value
    },
    {
      onMessage: (chunk: ChatStreamChunk) => {
        // 累加接收到的内容
        if (chunk.answer) {
          assistantMessage.content += chunk.answer
          // 强制触发响应式更新：通过创建新数组引用来触发Vue的响应式更新
          messages.value = [...messages.value]
          // 打印日志验证是否实时接收
          console.log("接收到内容片段，当前总长度:", assistantMessage.content.length)
        }
      },
      onAgentThought: (chunk: ChatStreamChunk) => {
        // 处理Agent思考过程
        if (!assistantMessage.agentThoughts) {
          assistantMessage.agentThoughts = []
        }
        const thought: AgentThought = {
          id: chunk.message_id || "",
          position: chunk.position || 0,
          thought: chunk.thought || "",
          observation: chunk.observation || "",
          tool: chunk.tool || "",
          tool_input: chunk.tool_input || "",
          created_at: chunk.created_at || Date.now()
        }
        assistantMessage.agentThoughts.push(thought)
        console.log("Agent思考:", thought)
      },
      onEnd: (conversationId: string) => {
        // 更新会话 ID
        currentConversationId.value = conversationId
        // 标记流式接收完成，触发markdown渲染
        assistantMessage.isStreaming = false
        isLoading.value = false
        currentAbortController = null
        console.log("消息接收完成, conversation_id:", conversationId)
      },
      onError: (error: string) => {
        console.error("消息发送失败:", error)
        assistantMessage.content = `错误: ${error}`
        isLoading.value = false
        currentAbortController = null
      }
    }
  )
}
</script>

<style scoped lang="scss">
// 遮罩层淡入淡出动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// 侧边栏滑入滑出动画
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>
