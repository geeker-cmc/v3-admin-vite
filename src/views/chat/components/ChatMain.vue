<template>
  <main class="flex-1 flex flex-col bg-white relative">
    <!-- 消息列表区域 -->
    <div v-if="messages.length > 0" class="flex-1 overflow-y-auto px-16px md:px-20px py-20px">
      <div class="max-w-1000px mx-auto w-full space-y-24px">
        <div v-for="msg in messages" :key="msg.id" class="message-item" :class="msg.role">
          <!-- 用户消息 -->
          <div v-if="msg.role === 'user'" class="flex justify-end">
            <div class="max-w-80% bg-[var(--el-color-primary)] text-white rounded-12px px-16px py-12px">
              <div class="text-15px whitespace-pre-wrap break-words">{{ msg.content }}</div>
            </div>
          </div>

          <!-- AI 消息 -->
          <div v-else-if="msg.content" class="flex justify-start">
            <div class="max-w-80%">
              <div class="flex items-start gap-12px">
                <div
                  class="w-32px h-32px rounded-full bg-[var(--el-color-primary)] flex items-center justify-center flex-shrink-0"
                >
                  <img src="@/assets/layouts/logo.png" alt="AI" class="w-20px h-20px object-contain brightness-0 invert" />
                </div>
                <div class="flex-1 bg-[#f7f8fa] rounded-12px px-16px py-12px">
                  <!-- 正在接收时显示纯文本，完成后渲染markdown -->
                  <div v-if="msg.isStreaming" class="text-15px whitespace-pre-wrap break-words typing-cursor">
                    {{ msg.content }}
                  </div>
                  <div v-else class="markdown-body text-15px" v-html="renderMarkdown(msg.content)" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="isLoading && messages[messages.length - 1]?.content === ''" class="flex justify-start">
          <div class="bg-[#f7f8fa] rounded-12px px-16px py-12px">
            <div class="flex gap-4px">
              <span
                class="w-8px h-8px bg-[var(--el-color-primary)] rounded-full animate-bounce"
                style="animation-delay: 0s"
              />
              <span
                class="w-8px h-8px bg-[var(--el-color-primary)] rounded-full animate-bounce"
                style="animation-delay: 0.2s"
              />
              <span
                class="w-8px h-8px bg-[var(--el-color-primary)] rounded-full animate-bounce"
                style="animation-delay: 0.4s"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 欢迎页面（空白状态） -->
    <div
      v-else
      class="flex-1 flex flex-col items-center justify-center py-20px md:py-40px px-16px md:px-20px max-w-1000px mx-auto w-full"
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
    </div>

    <!-- 输入框区域（固定在底部） -->
    <div class="border-t border-[var(--el-border-color-lighter)] bg-white py-16px px-16px md:px-20px">
      <div class="w-full max-w-1000px mx-auto px-0 md:px-16px">
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
            :disabled="isLoading"
            @keyup.enter.exact="handleSend"
          />

          <div
            class="flex items-center justify-end gap-8px mt-8px pt-8px border-t border-[var(--el-border-color-lighter)]"
          >
            <el-button
              type="primary"
              circle
              :icon="Top"
              :disabled="!inputText.trim() || isLoading"
              @click="handleSend"
            />
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from "vue"
import { Paperclip, Microphone, Top } from "@element-plus/icons-vue"
import MarkdownIt from "markdown-it"
import hljs from "highlight.js"
import "highlight.js/styles/github.css"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  isStreaming?: boolean // 是否正在流式接收中
}

interface Props {
  messages?: Message[]
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  messages: () => [],
  isLoading: false
})

const inputText = ref("")

const emit = defineEmits<{
  send: [message: string]
}>()

// 配置 markdown-it
const md: MarkdownIt = new MarkdownIt({
  html: false, // 禁用HTML标签以避免内容丢失
  linkify: true,
  typographer: true,
  breaks: true, // 转换换行符
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' + hljs.highlight(str, { language: lang, ignoreIllegals: true }).value + "</code></pre>"
      } catch (__) {
        // 忽略错误
      }
    }
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + "</code></pre>"
  }
})

// 渲染 markdown
const renderMarkdown = (content: string) => {
  if (!content) return ""
  
  console.log("=== Markdown解析前 ===")
  console.log("内容长度:", content.length)
  console.log("原始内容:", content)
  
  try {
    const rendered = md.render(content)
    console.log("=== Markdown解析后 ===")
    console.log("HTML长度:", rendered.length)
    console.log("HTML内容:", rendered)
    return rendered
  } catch (error) {
    console.error("Markdown渲染错误:", error)
    // 如果渲染失败，返回转义后的原始内容
    return content.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>")
  }
}

const handleSend = () => {
  if (!inputText.value.trim() || props.isLoading) return
  emit("send", inputText.value)
  inputText.value = ""
}

// 滚动到底部的函数
const scrollToBottom = () => {
  // 使用 requestAnimationFrame 确保在 DOM 更新后执行
  requestAnimationFrame(() => {
    nextTick(() => {
      const mainElement = document.querySelector(".overflow-y-auto")
      if (mainElement) {
        mainElement.scrollTo({
          top: mainElement.scrollHeight,
          behavior: "smooth"
        })
      }
    })
  })
}

// 监听消息数组的深度变化，包括内容变化
watch(
  () => props.messages,
  () => {
    scrollToBottom()
  },
  { deep: true, immediate: false }
)

// 监听loading状态变化时也滚动
watch(
  () => props.isLoading,
  () => {
    scrollToBottom()
  }
)
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

// 打字效果动画
.typing-cursor::after {
  content: "";
  display: inline-block;
  width: 2px;
  height: 1em;
  background-color: var(--el-color-primary);
  margin-left: 2px;
  animation: blink 1s step-end infinite;
  vertical-align: text-bottom;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

// 加载动画
@keyframes bounce {
  0%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-8px);
  }
}

.animate-bounce {
  animation: bounce 1.4s infinite;
}

// Markdown 样式
.markdown-body {
  line-height: 1.6;
  word-wrap: break-word;

  // 标题
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin-top: 24px;
    margin-bottom: 16px;
    font-weight: 600;
    line-height: 1.25;
  }

  h1 {
    font-size: 2em;
    border-bottom: 1px solid var(--el-border-color);
    padding-bottom: 0.3em;
  }

  h2 {
    font-size: 1.5em;
    border-bottom: 1px solid var(--el-border-color);
    padding-bottom: 0.3em;
  }

  h3 {
    font-size: 1.25em;
  }

  // 段落
  p {
    margin-top: 0;
    margin-bottom: 16px;
  }

  // 列表
  ul,
  ol {
    margin-top: 0;
    margin-bottom: 16px;
    padding-left: 2em;
  }

  li {
    margin-bottom: 0.25em;

    & > p {
      margin-bottom: 0;
    }
  }

  // 代码块
  pre {
    margin-top: 0;
    margin-bottom: 16px;
    padding: 16px;
    overflow: auto;
    font-size: 85%;
    line-height: 1.45;
    background-color: #f6f8fa;
    border-radius: 6px;
  }

  // 行内代码
  code {
    padding: 0.2em 0.4em;
    margin: 0;
    font-size: 85%;
    background-color: rgba(175, 184, 193, 0.2);
    border-radius: 6px;
  }

  pre code {
    display: block;
    padding: 0;
    margin: 0;
    overflow: visible;
    line-height: inherit;
    word-wrap: normal;
    background-color: transparent;
    border: 0;
  }

  // 引用块
  blockquote {
    margin: 0 0 16px 0;
    padding: 0 1em;
    color: var(--el-text-color-secondary);
    border-left: 0.25em solid var(--el-border-color);

    > :first-child {
      margin-top: 0;
    }

    > :last-child {
      margin-bottom: 0;
    }
  }

  // 表格
  table {
    margin-bottom: 16px;
    border-spacing: 0;
    border-collapse: collapse;
    width: 100%;
    overflow: auto;

    th,
    td {
      padding: 6px 13px;
      border: 1px solid var(--el-border-color);
    }

    th {
      font-weight: 600;
      background-color: #f6f8fa;
    }

    tr {
      background-color: #ffffff;
      border-top: 1px solid var(--el-border-color);

      &:nth-child(2n) {
        background-color: #f6f8fa;
      }
    }
  }

  // 分隔线
  hr {
    height: 0.25em;
    padding: 0;
    margin: 24px 0;
    background-color: var(--el-border-color);
    border: 0;
  }

  // 链接
  a {
    color: var(--el-color-primary);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  // 图片
  img {
    max-width: 100%;
    box-sizing: content-box;
  }
}
</style>
