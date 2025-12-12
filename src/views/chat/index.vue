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

    <ChatMain @send="handleSendMessage" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { Expand } from "@element-plus/icons-vue"
import { useDevice } from "@/hooks/useDevice"
import ChatSidebar from "./components/ChatSidebar.vue"
import ChatMain from "./components/ChatMain.vue"
import useResize from "@/layouts/hooks/useResize"

useResize()

const { isMobile } = useDevice()
const sidebarVisible = ref(false)

// 调试信息
console.log("isMobile:", isMobile.value)

const handleNewChat = () => {
  console.log("新建对话")
  // TODO: 实现新建对话逻辑
}

const handleNewChatAndCloseSidebar = () => {
  handleNewChat()
  if (isMobile.value) {
    sidebarVisible.value = false
  }
}

const handleSendMessage = (message: string) => {
  console.log("发送消息:", message)
  // TODO: 实现发送消息逻辑
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
