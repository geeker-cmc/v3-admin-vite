<template>
  <div class="flex h-100vh w-full overflow-hidden relative">
    <!-- 桌面端：直接显示侧边栏 -->
    <ChatSidebar
      v-if="!isMobile"
      :conversations="conversations"
      :current-conversation-id="currentConversationId"
      @new-chat="handleNewChat"
      @select-conversation="handleSelectConversation"
      @rename-conversation="handleRenameConversation"
      @delete-conversation="handleDeleteConversation"
    />

    <!-- 移动端：侧边栏 + 遮罩 -->
    <template v-else>
      <!-- 遮罩层 -->
      <transition name="fade">
        <div v-if="sidebarVisible" class="fixed inset-0 bg-black bg-opacity-50 z-999" @click="sidebarVisible = false" />
      </transition>

      <!-- 侧边栏（绝对定位） -->
      <transition name="slide">
        <div v-if="sidebarVisible" class="fixed left-0 top-0 h-full z-1000 shadow-lg">
          <ChatSidebar
            :is-mobile="true"
            :conversations="conversations"
            :current-conversation-id="currentConversationId"
            @new-chat="handleNewChatAndCloseSidebar"
            @select-conversation="handleSelectConversation"
            @rename-conversation="handleRenameConversation"
            @delete-conversation="handleDeleteConversation"
          />
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
import { ref, watch, onMounted } from "vue"
import { Expand } from "@element-plus/icons-vue"
import { ElMessageBox, ElMessage } from "element-plus"
import { useDevice } from "@/hooks/useDevice"
import ChatSidebar from "./components/ChatSidebar.vue"
import ChatMain from "./components/ChatMain.vue"
import useResize from "@/layouts/hooks/useResize"
import { sendChatMessageStreamApi, getConversationsApi, getConversationMessagesApi, deleteConversationApi, renameConversationApi } from "@/api/chat"
import type { ChatStreamChunk, ConversationItem } from "@/api/chat/types"
import { useUserStoreHook } from "@/store/modules/user"

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
const conversations = ref<ConversationItem[]>([])
const currentConversationId = ref("")
const isLoading = ref(false)
let currentAbortController: AbortController | null = null

// 调试信息
console.log("isMobile:", isMobile.value)

/** 加载会话列表 */
const loadConversationHistory = async () => {
  try {
    isLoading.value = true
    const response = await getConversationsApi({
      limit: 20
    })

    conversations.value = response.data
    console.log("✅ 加载会话列表成功")
    console.log("会话数量:", response.data.length)
    console.log("是否有更多:", response.has_more)
    console.log("会话列表:", response.data)
  } catch (error) {
    console.error("❌ 加载会话列表失败:", error)
  } finally {
    isLoading.value = false
  }
}

// 监听conversation_id变化，自动加载历史消息
watch(
  () => currentConversationId.value,
  (newId, oldId) => {
    // 当conversation_id从空变为有值，或者变为新的值时，加载历史消息
    if (newId && newId !== oldId) {
      loadConversationHistory()
    }
  }
)

// 页面初始化时加载历史消息
onMounted(() => {
  // 初始化时无论是否有conversation_id都调用接口
  loadConversationHistory()
})

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

/** 处理选择会话 */
const handleSelectConversation = async (conversationId: string) => {
  try {
    // 设置当前会话ID
    currentConversationId.value = conversationId
    isLoading.value = true
    
    // 调用接口获取会话历史消息
    const response = await getConversationMessagesApi({
      conversation_id: conversationId,
      limit: 50
    })

    // 将API返回的消息转换为组件格式
    const historyMessages: Message[] = []
    response.data.forEach((item) => {
      // AI回复（API返回的是最新的在前，反转后需要先加AI回复）
      historyMessages.push({
        id: `assistant-${item.id}`,
        role: "assistant",
        content: item.answer,
        timestamp: item.created_at * 1000,
        isStreaming: false
      })
      // 用户消息
      historyMessages.push({
        id: `user-${item.id}`,
        role: "user",
        content: item.query,
        timestamp: item.created_at * 1000
      })
    })

    // 反转顺序（API返回的是最新的在前，我们需要最旧的在前）
    messages.value = historyMessages.reverse()
    console.log("✅ 加载会话消息成功，共", response.data.length, "条对话")
    
    // 移动端关闭侧边栏
    if (isMobile.value) {
      sidebarVisible.value = false
    }
  } catch (error) {
    console.error("❌ 加载会话消息失败:", error)
  } finally {
    isLoading.value = false
  }
}

/** 处理删除会话 */
const handleDeleteConversation = async (conversationId: string) => {
  try {
    await ElMessageBox.confirm(
      "删除后，该对话将不可恢复。确认删除吗？",
      "永久删除对话",
      {
        confirmButtonText: "删除",
        cancelButtonText: "取消",
        type: "warning",
        confirmButtonClass: "el-button--danger",
        customClass: "delete-conversation-box",
        buttonSize: "default"
      }
    )

    // 确认删除后调用接口
    const userStore = useUserStoreHook()
    const userId = userStore.userId?.toString() || ""
    
    await deleteConversationApi({
      conversation_id: conversationId,
      user: userId
    })

    ElMessage.success("删除成功")

    // 如果删除的是当前选中的会话，清空消息列表
    if (conversationId === currentConversationId.value) {
      messages.value = []
      currentConversationId.value = ""
    }

    // 重新加载会话列表
    await loadConversationHistory()
  } catch (error: any) {
    // 用户取消删除
    if (error === "cancel") {
      return
    }
    console.error("❌ 删除会话失败:", error)
    ElMessage.error("删除失败，请重试")
  }
}

/** 处理重命名会话 */
const handleRenameConversation = async (conversationId: string, newName: string) => {
  try {
    const userStore = useUserStoreHook()
    const userId = userStore.userId?.toString() || ""
    
    await renameConversationApi({
      conversation_id: conversationId,
      user: userId,
      name: newName
    })

    ElMessage.success("重命名成功")

    // 重新加载会话列表
    await loadConversationHistory()
  } catch (error) {
    console.error("❌ 重命名会话失败:", error)
    ElMessage.error("重命名失败，请重试")
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

<style>
/* 自定义删除对话框样式 */
.delete-conversation-box {
  border-radius: 12px !important;
  padding: 24px !important;
}

.delete-conversation-box .el-message-box__header {
  padding-bottom: 16px !important;
}

.delete-conversation-box .el-message-box__title {
  font-size: 18px !important;
  font-weight: 600 !important;
  color: #303133 !important;
}

.delete-conversation-box .el-message-box__content {
  padding: 16px 0 !important;
}

.delete-conversation-box .el-message-box__message {
  font-size: 14px !important;
  color: #606266 !important;
  line-height: 1.6 !important;
}

.delete-conversation-box .el-message-box__btns {
  padding-top: 20px !important;
}

.delete-conversation-box .el-message-box__btns button {
  padding: 10px 20px !important;
  border-radius: 6px !important;
  font-size: 14px !important;
}

.delete-conversation-box .el-button--danger {
  background-color: transparent !important;
  border: 1px solid #f56c6c !important;
  color: #f56c6c !important;
}

.delete-conversation-box .el-button--danger:hover {
  background-color: #fef0f0 !important;
}
</style>
