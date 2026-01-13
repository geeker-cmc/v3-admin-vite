import { router } from "@/router"
import { useUserStoreHook } from "@/store/modules/user"
import { usePermissionStoreHook } from "@/store/modules/permission"
import { useAppStoreHook } from "@/store/modules/app"
import { ElMessage } from "element-plus"
import { setRouteChange } from "@/hooks/useRouteListener"
import { useTitle } from "@/hooks/useTitle"
import { getToken } from "@/utils/cache/cookies"
import routeSettings from "@/config/route"
import isWhiteList from "@/config/white-list"
import NProgress from "nprogress"
import "nprogress/nprogress.css"

NProgress.configure({ showSpinner: false })
const { setTitle } = useTitle()
const userStore = useUserStoreHook()
const permissionStore = usePermissionStoreHook()
const appStore = useAppStoreHook()

router.beforeEach(async (to, _from, next) => {
  NProgress.start()

  // 新增：检测 URL 中的 token 和 userName 参数（第三方登录）
  const urlToken = to.query.token as string
  const urlUserName = to.query.userName as string
  const urlUserId = to.query.userId as string
  if (urlToken && urlUserName && urlUserId) {
    // 对参数进行 decode（虽然 Vue Router 会自动 decode，但为了确保安全，手动再处理一次）
    const decodedToken = decodeURIComponent(urlToken)
    const decodedUserName = decodeURIComponent(urlUserName)
    const decodedUserId = Number(decodeURIComponent(urlUserId))

    // 设置外部登录状态
    appStore.setExternalLogin(true)

    // 调用外部登录方法
    userStore.externalLogin(decodedToken, decodedUserName, decodedUserId)

    // 移除 URL 中的 token 和 userName 参数，避免刷新时重复处理
    const query = { ...to.query }
    delete query.token
    delete query.userName
    delete query.userId

    // 重定向到首页，去掉 URL 参数
    // return next({
    //   path: to.path === "/login" ? "/" : to.path,
    //   query,
    //   replace: true
    // })
  }

  // 如果没有登陆
  if (!getToken()) {
    // 如果在免登录的白名单中，则直接进入
    if (isWhiteList(to)) return next()
    // 其他没有访问权限的页面将被重定向到登录页面
    return next("/login")
  }

  // 如果已经登录，并准备进入 Login 页面，则重定向到主页
  if (to.path === "/login") {
    return next({ path: "/" })
  }

  // 如果用户已经获得其权限角色
  if (userStore.roles.length !== 0) return next()

  // 否则要重新获取权限角色
  try {
    console.log("重新获取用户信息")
    await userStore.getInfo()
    // 注意：角色必须是一个数组！ 例如: ["admin"] 或 ["developer", "editor"]
    const roles = userStore.roles
    // 生成可访问的 Routes
    routeSettings.dynamic ? permissionStore.setRoutes(roles) : permissionStore.setAllRoutes()
    // 将 "有访问权限的动态路由" 添加到 Router 中
    permissionStore.addRoutes.forEach((route) => router.addRoute(route))
    // 设置 replace: true, 因此导航将不会留下历史记录
    next({ ...to, replace: true })
  } catch (error) {
    // 过程中发生任何错误，都直接重置 Token，并重定向到登录页面
    userStore.resetToken()
    ElMessage.error((error as Error).message || "路由守卫过程发生错误")
    next("/login")
  }
})

router.afterEach((to) => {
  setRouteChange(to)
  setTitle(to.meta.title)
  NProgress.done()
})
