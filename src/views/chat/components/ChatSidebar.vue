<template>
  <aside
    :class="[
      'flex flex-col bg-[#f7f8fa]',
      isMobile
        ? 'w-280px h-full border-none'
        : 'border-r border-[var(--el-border-color)] transition-width duration-300',
      !isMobile && (isCollapsed ? 'w-0 border-none overflow-visible' : 'w-260px')
    ]"
  >
    <!-- 收起状态 - 绝对定位在左上角（仅桌面端） -->
    <div
      v-if="!isMobile && isCollapsed"
      class="absolute top-16px left-16px flex flex-row items-center gap-8px px-12px py-8px bg-white rounded-12px shadow-[0_2px_12px_rgba(0,0,0,0.1)] z-1000 transition-all duration-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.15)]"
    >
      <img
        src="@/assets/layouts/logo1.png"
        alt="Compass Logo"
        class="w-32px h-32px object-contain cursor-pointer transition-transform duration-200 hover:scale-110 flex-shrink-0"
        @click="toggleSidebar"
      />
      <div class="flex flex-row items-center gap-10px">
        <!-- 展开侧边栏 -->
        <el-tooltip content="展开" placement="bottom">
          <el-icon
            :size="18"
            class="cursor-pointer text-[var(--el-text-color-regular)] transition-colors"
            @click="toggleSidebar"
          >
            <Expand />
          </el-icon>
        </el-tooltip>

        <!-- 新建对话 -->
        <el-tooltip content="新建对话" placement="bottom">
          <el-icon
            :size="18"
            class="cursor-pointer text-[var(--el-text-color-regular)] transition-colors"
            @click="handleNewChat"
          >
            <Plus />
          </el-icon>
        </el-tooltip>
      </div>
    </div>

    <!-- 展开状态 -->
    <template v-if="isMobile || !isCollapsed">
      <!-- Logo 和品牌名 -->
      <div class="p-16px border-b border-[var(--el-border-color-lighter)] flex items-center justify-between">
        <div class="flex items-center gap-12px cursor-pointer" @click="goToHome">
          <img src="@/assets/layouts/logo1.png" alt="Compass Logo" class="w-32px h-32px object-contain" />
          <span class="text-20px font-600 text-[#1f2937]">新译科技</span>
        </div>

        <!-- 收起按钮（仅桌面端显示） -->
        <el-tooltip v-if="!isMobile" content="收起" placement="right">
          <el-button text @click="toggleSidebar">
            <el-icon><Fold /></el-icon>
          </el-button>
        </el-tooltip>
      </div>

      <!-- 侧边栏内容 -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- 新建对话按钮 -->
        <div class="p-16px border-b border-[var(--el-border-color-lighter)]">
          <el-button type="primary" :icon="Plus" class="w-full! h-40px! text-14px!" @click="handleNewChat">
            开启新对话
          </el-button>
        </div>

        <!-- 历史对话列表 -->
        <div class="flex-1 flex flex-col overflow-hidden">
          <div class="py-12px px-16px text-13px text-[var(--el-text-color-secondary)] font-500">历史对话</div>
          <div class="flex-1 overflow-y-auto px-8px">
            <div
              v-for="conversation in conversations"
              :key="conversation.id"
              :class="[
                'group mb-4px px-12px py-10px rounded-8px transition-all duration-200 text-14px flex items-center justify-between',
                conversation.id === currentConversationId
                  ? 'bg-[var(--el-color-primary-light-9)] text-[var(--el-color-primary)]'
                  : 'text-[#1f2937] hover:bg-[var(--el-color-primary-light-9)]'
              ]"
            >
              <!-- 编辑状态 -->
              <input
                v-if="editingId === conversation.id"
                :ref="setInputRef"
                v-model="editingName"
                type="text"
                class="flex-1 bg-white border border-[var(--el-color-primary)] rounded-4px px-8px py-6px text-14px leading-20px outline-none h-32px"
                @blur="saveEditing(conversation.id, conversation.name)"
                @keyup.enter="saveEditing(conversation.id, conversation.name)"
                @keyup.esc="editingId = ''"
                @click.stop
              />
              <!-- 正常显示 -->
              <span v-else class="flex-1 truncate cursor-pointer" @click="emit('selectConversation', conversation.id)">{{
                conversation.name
              }}</span>
              <div
                v-if="editingId !== conversation.id"
                :class="[
                  'flex-shrink-0 ml-8px transition-opacity duration-200',
                  conversation.id === currentConversationId ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                ]"
                @click.stop
              >
                <el-dropdown trigger="click" placement="bottom-end">
                  <el-icon :size="16" class="cursor-pointer">
                    <MoreFilled />
                  </el-icon>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="startEditing(conversation)">
                        <el-icon class="mr-8px"><Edit /></el-icon>
                        重命名
                      </el-dropdown-item>
                      <el-dropdown-item @click="emit('deleteConversation', conversation.id)">
                        <el-icon class="mr-8px text-red-500"><Delete /></el-icon>
                        <span class="text-red-500">删除</span>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
            <div v-if="conversations.length === 0" class="text-center py-40px text-[var(--el-text-color-secondary)] text-13px">
              暂无历史对话
            </div>
          </div>
        </div>
      </div>
    </template>
  </aside>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue"
import type { ComponentPublicInstance } from "vue"
import { useRouter } from "vue-router"
import { Plus, Expand, Fold, MoreFilled, Edit, Delete } from "@element-plus/icons-vue"
import type { ConversationItem } from "@/api/chat/types"

interface Props {
  isMobile?: boolean
  conversations?: ConversationItem[]
  currentConversationId?: string
}

withDefaults(defineProps<Props>(), {
  isMobile: false,
  conversations: () => [],
  currentConversationId: ""
})

const isCollapsed = ref(false)
const editingId = ref<string>("") // 正在编辑的会话ID
const editingName = ref<string>("") // 编辑中的名称
const router = useRouter()

const emit = defineEmits<{
  newChat: []
  selectConversation: [conversationId: string]
  renameConversation: [conversationId: string, newName: string]
  deleteConversation: [conversationId: string]
}>()

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

const handleNewChat = () => {
  emit("newChat")
}

// 跳转到首页
const goToHome = () => {
  router.push("/")
}

// 开始编辑
const startEditing = (conversation: ConversationItem) => {
  editingId.value = conversation.id
  editingName.value = conversation.name
}

// 输入框ref回调，自动聚焦
const setInputRef = (el: Element | ComponentPublicInstance | null) => {
  if (el && el instanceof HTMLInputElement) {
    nextTick(() => {
      el.focus()
      // 将光标移到文本末尾
      const len = el.value.length
      el.setSelectionRange(len, len)
    })
  }
}

// 保存编辑
const saveEditing = (conversationId: string, originalName: string) => {
  if (editingName.value.trim() && editingName.value !== originalName) {
    emit("renameConversation", conversationId, editingName.value.trim())
  }
  editingId.value = ""
  editingName.value = ""
}
</script>
