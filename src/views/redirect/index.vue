<script lang="ts" setup>
import { useRoute, useRouter } from "vue-router"

const route = useRoute()
const router = useRouter()

router.replace({ path: "/" + route.params.path })
</script>

<template>
  <div />
</template>
