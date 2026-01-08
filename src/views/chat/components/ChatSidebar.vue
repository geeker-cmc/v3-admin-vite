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
        <div class="flex items-center gap-12px">
          <img src="@/assets/layouts/logo1.png" alt="Compass Logo" class="w-32px h-32px object-contain" />
          <span class="text-20px font-600 text-[#1f2937]">Compass</span>
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
            <!-- 暂时为空 -->
          </div>
        </div>
      </div>
    </template>
  </aside>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { Plus, Expand, Fold } from "@element-plus/icons-vue"

interface Props {
  isMobile?: boolean
}

withDefaults(defineProps<Props>(), {
  isMobile: false
})

const isCollapsed = ref(false)

const emit = defineEmits<{
  newChat: []
}>()

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

const handleNewChat = () => {
  emit("newChat")
}
</script>
