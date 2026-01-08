export interface LoginRequestData {
  /** admin 或 editor */
  username: string
  /** 密码 */
  password: string
}

export interface RegisterRequestData {
  /** 用户名 */
  username: string
  /** 密码 */
  password: string
  /** 验证码 */
  confirmPassword: string
}

export type LoginCodeResponseData = ApiResponseData<string>

export type LoginResponseData = ApiResponseData<{
  accessToken: string
  refreshToken: string
  username: string
  userId: number
}>

export type UserInfoResponseData = ApiResponseData<{ username: string; roles: string[] }>

export type CSFTokenResponseData = ApiResponseData<string>
