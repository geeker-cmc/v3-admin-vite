<template>
  <el-form
    ref="registerFormRef"
    :model="registerFormData"
    :rules="registerFormRules"
    @keyup.enter="handleRegister"
    hide-required-asterisk
  >
    <h2 class="text-2xl font-bold text-center w-[100%]">注册</h2>
    <el-form-item prop="username" label="用户名" label-position="top">
      <el-input
        v-model.trim="registerFormData.username"
        placeholder="用户名"
        type="text"
        tabindex="1"
        size="large"
        clearable
      />
    </el-form-item>
    <el-form-item prop="password" label="密码" label-position="top">
      <el-input
        v-model.trim="registerFormData.password"
        placeholder="密码"
        type="password"
        tabindex="2"
        size="large"
        show-password
        clearable
      />
    </el-form-item>
    <el-form-item prop="confirmPassword" label="确认密码" label-position="top">
      <el-input
        v-model.trim="registerFormData.confirmPassword"
        placeholder="确认密码"
        type="password"
        tabindex="2"
        size="large"
        show-password
        clearable
      />
    </el-form-item>
    <div>
      <el-button class="w-full" :loading="loading" type="primary" size="large" @click.prevent="handleRegister"
        >注 册</el-button
      >
    </div>

    <div>
      <el-button class="w-full mt-18px" size="large" @click.prevent="toLogin">已有账号？去登录</el-button>
    </div>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue"
import { type FormInstance, type FormRules } from "element-plus"
import { RegisterRequestData } from "@/api/login/types/login"

const emit = defineEmits(["to-login"])
const registerFormRef = ref<FormInstance | null>(null)

const loading = ref(false)

const registerFormData: RegisterRequestData = reactive({
  username: "",
  password: "",
  confirmPassword: ""
})

const registerFormRules: FormRules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 8, max: 16, message: "长度在 8 到 16 个字符", trigger: "blur" }
  ],
  confirmPassword: [
    { required: true, message: "请输入确认密码", trigger: "blur" },
    { min: 8, max: 16, message: "长度在 8 到 16 个字符", trigger: "blur" }
  ]
}
const handleRegister = () => {
  registerFormRef.value?.validate((valid: boolean, fields) => {
    if (valid) {
      console.log("表单校验通过，执行注册逻辑", fields)
    } else {
      console.error("表单校验不通过", fields)
    }
  })
}

const toLogin = () => {
  emit("to-login")
}
</script>

<style scoped></style>
