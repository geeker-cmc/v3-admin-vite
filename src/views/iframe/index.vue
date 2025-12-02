<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue"
import { useRoute } from "vue-router"

const route = useRoute()
const iframeRef = ref<HTMLIFrameElement>()
const loading = ref(true)

/** 基础 URL */
const baseUrl = "https://gtcom-chainbrain.istari.cn/#/embed/region"

/** 从路由 meta 中获取 iframe URL */
const iframeUrl = computed(() => {
  const page = route.meta.page as string
  return page ? `${baseUrl}?page=${encodeURIComponent(page)}` : ""
})

/** iframe 加载完成 */
const handleLoad = () => {
  loading.value = false
}

/** 监听路由变化，重新加载 iframe */
watch(
  () => route.path,
  () => {
    loading.value = true
  }
)

onMounted(() => {
  if (!iframeUrl.value) {
    loading.value = false
  }
})
</script>

<template>
  <div class="relative w-full h-full overflow-hidden p-20px">
    <!-- Loading 状态 -->
    <div v-show="loading" class="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
      <el-icon class="is-loading text-32px mb-12px">
        <Loading />
      </el-icon>
      <span class="text-14px text-#666">加载中...</span>
    </div>
    <iframe
      v-if="iframeUrl"
      ref="iframeRef"
      :src="iframeUrl"
      frameborder="0"
      class="w-full h-full border-none"
      @load="handleLoad"
    />
    <el-empty v-else description="未配置页面地址" />
  </div>
</template>
