<template>
  <main class="flex-1 flex flex-col bg-white relative">
    <!-- 欢迎页面（空白状态） -->
    <div
      class="flex-1 flex flex-col items-center justify-center py-20px md:py-40px px-16px md:px-20px max-w-800px mx-auto w-full"
    >
      <div class="text-center mb-40px md:mb-60px">
        <img
          src="@/assets/layouts/logo.png"
          alt="Compass Logo"
          class="w-48px h-48px md:w-64px md:h-64px object-contain"
        />
        <h1 class="text-22px md:text-28px font-500 text-[#1f2937] mt-16px md:mt-24px mb-8px md:mb-12px">
          今天有什么可以帮到你?
        </h1>
        <p class="text-14px md:text-16px text-[var(--el-text-color-secondary)]">开启新对话，探索更多可能</p>
      </div>

      <!-- 输入框区域 -->
      <div class="w-full max-w-700px px-0 md:px-16px">
        <div
          class="input-wrapper relative bg-[#f7f8fa] rounded-12px px-16px py-12px border border-[var(--el-border-color-lighter)] transition-all duration-300 focus-within:border-[var(--el-color-primary)] focus-within:shadow-[0_0_0_3px_var(--el-color-primary-light-9)]"
        >
          <el-input
            v-model="inputText"
            type="textarea"
            :rows="1"
            :autosize="{ minRows: 1, maxRows: 6 }"
            placeholder="发送消息"
            class="custom-textarea"
            @keyup.enter.exact="handleSend"
          />

          <div
            class="flex items-center justify-end gap-8px mt-8px pt-8px border-t border-[var(--el-border-color-lighter)]"
          >
            <el-button text :icon="Paperclip" title="添加附件" />
            <el-button text :icon="Microphone" title="语音输入" />
            <el-button type="primary" circle :icon="Top" :disabled="!inputText.trim()" @click="handleSend" />
          </div>
        </div>

        <!-- <div class="flex gap-8px md:gap-12px mt-12px px-0 md:px-16px flex-wrap">
          <el-button
            text
            size="small"
            class="text-[var(--el-text-color-secondary)]! hover:text-[var(--el-color-primary)]! text-12px! md:text-14px!"
          >
            <el-icon><Reading /></el-icon>
            <span class="hidden sm:inline">深度思考</span>
          </el-button>
          <el-button
            text
            size="small"
            class="text-[var(--el-text-color-secondary)]! hover:text-[var(--el-color-primary)]! text-12px! md:text-14px!"
          >
            <el-icon><Connection /></el-icon>
            <span class="hidden sm:inline">联网搜索</span>
          </el-button>
        </div> -->
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { Paperclip, Microphone, Top, Reading, Connection } from "@element-plus/icons-vue"

const inputText = ref("")

const emit = defineEmits<{
  send: [message: string]
}>()

const handleSend = () => {
  if (!inputText.value.trim()) return
  emit("send", inputText.value)
  inputText.value = ""
}
</script>

<style scoped lang="scss">
.custom-textarea {
  :deep(.el-textarea__inner) {
    background: transparent;
    border: none;
    box-shadow: none;
    padding: 0;
    resize: none;
    font-size: 15px;

    &:focus {
      box-shadow: none;
    }
  }
}
</style>
