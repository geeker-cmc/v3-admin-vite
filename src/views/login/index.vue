<template>
  <div class="h-[100%] relative lt-xl:bg-[var(--login-bg-color)] lt-sm:px-10px lt-xl:px-10px lt-md:px-10px">
    <el-scrollbar class="h-full">
      <div class="relative flex mx-auto min-h-100vh">
        <div class="left flex-1 bg-gray-500 bg-opacity-20 relative p-30px lt-xl:hidden">
          <div class="flex items-center relative text-white">
            <img src="@/assets/layouts/logo.png" alt="" class="w-48px h-48px mr-10px" />
            <span class="text-20px font-bold">新译科技</span>
          </div>
          <div class="flex justify-center items-center h-[calc(100%-60px)]">
            <TransitionGroup appear tag="div" enter-active-class="animate__animated animate__bounceInLeft">
              <img src="@/assets/login/login-box-bg.svg" key="1" alt="" class="w-350px" />
              <div class="text-3xl text-white" key="2">欢迎使用投资招引AI平台</div>
            </TransitionGroup>
          </div>
        </div>
        <div class="flex-1 p-30px lt-sm:p-10px dark:bg-[var(--login-bg-color)] relative">
          <div class="flex justify-between items-center text-white at-2xl:justify-end at-xl:justify-end">
            <div class="flex items-center at-2xl:hidden at-xl:hidden">
              <img src="@/assets/layouts/logo.png" alt="" class="w-48px h-48px mr-10px" />
              <span class="text-20px font-bold">新译科技</span>
            </div>

            <div class="flex justify-end items-center space-x-10px">
              <ThemeSwitch />
              <LocaleDropdown class="lt-xl:text-white dark:text-white" />
            </div>
          </div>
          <Transition appear enter-active-class="animate__animated animate__bounceInRight">
            <div
              class="h-full flex items-center m-auto w-[100%] at-2xl:max-w-500px at-xl:max-w-500px at-md:max-w-500px at-lg:max-w-500px"
            >
              <LoginForm
                v-if="isLogin"
                class="p-20px h-auto m-auto lt-xl:rounded-3xl lt-xl:bg-white min-w-400px"
                @to-register="toRegister"
              />
              <RegisterForm
                v-else
                class="p-20px h-auto m-auto lt-xl:rounded-3xl lt-xl:bg-white min-w-400px"
                @to-login="toLogin"
              />
            </div>
          </Transition>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import LoginForm from "./components/login-form.vue"
import RegisterForm from "./components/register-form.vue"
const isLogin = ref(true)

const toRegister = () => {
  isLogin.value = false
}

const toLogin = () => {
  isLogin.value = true
}
</script>

<style scoped lang="scss">
.left {
  &::before {
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
    width: 100%;
    height: 100%;
    background-image: url("@/assets/login/login-bg.svg");
    background-position: center;
    background-repeat: no-repeat;
    content: "";
  }
}
</style>
