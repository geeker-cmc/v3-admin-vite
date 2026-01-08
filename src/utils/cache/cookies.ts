/** 统一处理 Cookie */

import CacheKey from "@/constants/cache-key"
import Cookies from "js-cookie"

export const getToken = () => {
  return Cookies.get(CacheKey.TOKEN)
}
export const setToken = (token: string) => {
  Cookies.set(CacheKey.TOKEN, token)
}
export const removeToken = () => {
  Cookies.remove(CacheKey.TOKEN)
}

export const getUserName = () => {
  return Cookies.get(CacheKey.USER_NAME)
}
export const setUserName = (token: string) => {
  Cookies.set(CacheKey.USER_NAME, token)
}
export const removeUserName = () => {
  Cookies.remove(CacheKey.USER_NAME)
}
export const setUserId = (userId: string) => {
  Cookies.set(CacheKey.USER_ID, userId)
}
export const getUserId = () => {
  return Cookies.get(CacheKey.USER_ID)
}
export const removeUserId = () => {
  Cookies.remove(CacheKey.USER_ID)
}
