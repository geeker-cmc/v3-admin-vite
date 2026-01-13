import { ref } from "vue"
import { pinia } from "@/store"
import { defineStore } from "pinia"
import { useTagsViewStore } from "./tags-view"
import { useSettingsStore } from "./settings"
import {
  getToken,
  removeToken,
  setToken,
  getUserName,
  setUserName,
  removeUserName,
  setUserId,
  getUserId,
  removeUserId
} from "@/utils/cache/cookies"
import { resetRouter } from "@/router"
import { loginApi } from "@/api/login"
import { type LoginRequestData } from "@/api/login/types/login"
import routeSettings from "@/config/route"

export const useUserStore = defineStore("user", () => {
  const token = ref<string>(getToken() || "")
  const roles = ref<string[]>([])
  const username = ref<string>("")
  const userId = ref<number>()

  const tagsViewStore = useTagsViewStore()
  const settingsStore = useSettingsStore()

  /** 登录 */
  const login = async ({ username: _username, password }: LoginRequestData) => {
    try {
      const { data } = await loginApi({ username: _username, password })
      setToken(data.accessToken)
      setUserName(data.username)
      setUserId(`${data.userId}`)
      username.value = data.username
      token.value = data.accessToken
      userId.value = data.userId
    } catch (error) {
      console.log("登录失败", error)
    }
  }

  const externalLogin = (_token: string, userName: string, _userId: number) => {
    setToken(_token)
    setUserName(userName)
    setUserId(`${_userId}`)
    username.value = userName
    token.value = _token
    userId.value = _userId
  }

  /** 获取用户详情 */
  const getInfo = async () => {
    if (getUserName()) {
      username.value = getUserName() || ""
      // 验证返回的 roles 是否为一个非空数组，否则塞入一个没有任何作用的默认角色，防止路由守卫逻辑进入无限循环
      userId.value = Number(getUserId())
      roles.value = routeSettings.defaultRoles
    }
  }
  /** 模拟角色变化 */
  const changeRoles = async (role: string) => {
    const newToken = "token-" + role
    token.value = newToken
    setToken(newToken)
    // 用刷新页面代替重新登录
    window.location.reload()
  }
  /** 登出 */
  const logout = () => {
    removeToken()
    removeUserName()
    removeUserId()
    token.value = ""
    roles.value = []
    userId.value = undefined
    resetRouter()
    _resetTagsView()
  }
  /** 重置 Token */
  const resetToken = () => {
    removeToken()
    token.value = ""
    roles.value = []
  }
  /** 重置 Visited Views 和 Cached Views */
  const _resetTagsView = () => {
    if (!settingsStore.cacheTagsView) {
      tagsViewStore.delAllVisitedViews()
      tagsViewStore.delAllCachedViews()
    }
  }

  return { token, roles, username, login, getInfo, changeRoles, logout, resetToken, externalLogin, userId }
})

/**
 * 在 SPA 应用中可用于在 pinia 实例被激活前使用 store
 * 在 SSR 应用中可用于在 setup 外使用 store
 */
export function useUserStoreHook() {
  return useUserStore(pinia)
}
