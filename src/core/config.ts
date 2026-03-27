import type { App, AppContext, Component, Plugin } from 'vue'

/**
 * 全局配置选项
 */
export interface ModalKitConfig {
  /** 异步加载组件前的回调（如显示全局 loading） */
  beforeLoading?: () => void
  /** 异步加载组件后的回调（如隐藏全局 loading） */
  afterLoading?: () => void
  /** 加载失败时的提示函数 */
  showMessage?: (msg: string) => void
  /** 自定义根包裹组件（如 ConfigProvider、I18nProvider） */
  mountRootComponent?: Component
}

/** 全局配置实例 */
let globalConfig: ModalKitConfig = {}

/** 根应用上下文缓存 */
let rootAppContext: AppContext | null = null

/**
 * 设置全局配置
 */
export function setModalKitConfig(config: ModalKitConfig): void {
  globalConfig = { ...globalConfig, ...config }
}

/**
 * 获取全局配置
 */
export function getModalKitConfig(): ModalKitConfig {
  return globalConfig
}

/**
 * 设置根应用上下文
 */
export function setRootAppContext(ctx: AppContext): void {
  rootAppContext = ctx
}

/**
 * 获取根应用上下文
 */
export function getRootAppContext(): AppContext | null {
  return rootAppContext
}

/**
 * Vue 插件形式的初始化方法
 *
 * @example
 * ```ts
 * import { createModalKit } from 'modalkit'
 *
 * const app = createApp(App)
 * app.use(createModalKit({
 *   showMessage: (msg) => ElMessage.error(msg),
 * }))
 * ```
 */
export function createModalKit(config: ModalKitConfig = {}): Plugin {
  return {
    install(app: App) {
      setRootAppContext(app._context)
      setModalKitConfig(config)
    },
  }
}
