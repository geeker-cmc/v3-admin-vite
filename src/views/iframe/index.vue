<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue"
import { useRoute } from "vue-router"
import { createCSFTokenApi } from "@/api/login"

const route = useRoute()
const iframeRef = ref<HTMLIFrameElement>()
const loading = ref(true)
const clientInfo = ref<string>("")

/** 基础 URL */
const baseUrl = "https://compass-web.raycoding.com/#/embed/region"

/** 从路由 meta 中获取 iframe URL */
const iframeUrl = computed(() => {
  const page = route.meta.page as string
  if (!page || !clientInfo.value) return ""
  const url = `${baseUrl}?page=${page}&clientInfo=${clientInfo.value}&clientId=gtcom-chainbrain-prod&region=CSF_CN_110000`
  console.log("最终的 iframeUrl:", url)
  return url
})

/** 获取 clientInfo */
const fetchClientInfo = async () => {
  try {
    const response = await createCSFTokenApi()
    console.log("获取到的 clientInfo:", response)
    if (response?.data) {
      clientInfo.value = response.data
    }
  } catch (error) {
    console.error("获取 clientInfo 失败:", error)
    loading.value = false
  }
}

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

onMounted(async () => {
  await fetchClientInfo()
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
