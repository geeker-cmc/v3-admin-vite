import { request } from "@/utils/service"
import type * as Login from "./types/login"

/** 登录并返回 Token */
export function loginApi(data: Login.LoginRequestData) {
  return request<Login.LoginResponseData>({
    url: "/api/auth/login",
    method: "post",
    data
  })
}

export function createCSFTokenApi() {
  return request<Login.CSFTokenResponseData>({
    url: "/api/auth/csf/token",
    method: "get"
  }).catch((error) => {})
}
