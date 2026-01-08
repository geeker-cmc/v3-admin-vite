import { request } from "@/utils/service"
import type * as Login from "./types/login"

const base_url = import.meta.env.VITE_BASE_API

/** 登录并返回 Token */
export function loginApi(data: Login.LoginRequestData) {
  return request<Login.LoginResponseData>({
    url: `${base_url}/api/auth/login`,
    method: "post",
    data
  })
}

export function createCSFTokenApi() {
  return request<Login.CSFTokenResponseData>({
    url: `${base_url}/api/auth/csf/token`,
    method: "get"
  })
}
