<script lang="ts" setup>
defineOptions({ name: "Dashboard" })
import { onMounted } from "vue"
// import { useUserStore } from "@/store/modules/user"
import Admin from "./components/Admin.vue"
// import Editor from "./components/Editor.vue"

// const userStore = useUserStore()
// const isAdmin = userStore.roles.includes("admin")
onMounted(() => {
  console.log("Dashboard mounted >>>>")
})
</script>

<template>
  <Admin />
</template>
