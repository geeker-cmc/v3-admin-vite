<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue"
import { useRoute } from "vue-router"

const route = useRoute()
const iframeRef = ref<HTMLIFrameElement>()
const loading = ref(true)

/** 从路由 meta 中获取 iframe URL */
const iframeUrl = computed(() => {
  return (route.meta.iframeUrl as string) || ""
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
    console.warn("未配置 iframeUrl")
    loading.value = false
  }
})
</script>

<template>
  <div class="app-container">
    <!-- Loading 状态 -->
    <div v-show="loading" class="loading-mask">
      <el-icon class="is-loading">
        <Loading />
      </el-icon>
      <span>加载中...</span>
    </div>

    <!-- iframe -->
    <iframe
      v-if="iframeUrl"
      ref="iframeRef"
      :src="iframeUrl"
      frameborder="0"
      class="iframe-content"
      @load="handleLoad"
    />

    <!-- 未配置 URL 提示 -->
    <el-empty v-else description="未配置页面地址" />
  </div>
</template>

<style lang="scss" scoped>
.iframe-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.loading-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  z-index: 10;

  .el-icon {
    font-size: 32px;
    margin-bottom: 12px;
  }

  span {
    font-size: 14px;
    color: #666;
  }
}

.iframe-content {
  width: 100%;
  height: 100%;
  border: none;
}
</style>
