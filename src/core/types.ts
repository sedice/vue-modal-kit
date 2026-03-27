import type { Component, ComponentPublicInstance, Ref } from 'vue'

/**
 * 从组件类型中推导 props 类型
 */
export type InferComponentPropsType<T> = T extends new (...args: any[]) => any
  ? InstanceType<T>['$props']
  : T extends (...args: any[]) => any
    ? Parameters<T>[0] extends undefined
      ? {}
      : NonNullable<Parameters<T>[0]>
    : {}

/**
 * 简化联合类型的展示（将交叉类型扁平化）
 */
export type Simplify<T> = T extends any ? { [P in keyof T]: T[P] } : never

/**
 * 弹窗组件必须接受的 props 约定
 * 每个被 modalkit 管理的弹窗组件都应声明这些 props
 */
export type ModalProps = {
  /** 弹窗是否可见 */
  visible?: boolean
  /** visible 的双向绑定回调 */
  'onUpdate:visible'?: (visible: boolean) => void
  /** 弹窗打开时的回调注册函数 */
  onModalOpen?: (fn: () => void) => () => void
}

import type { 
  AllowedComponentProps, 
  ComponentCustomProps, 
  VNodeProps 
} from 'vue'

/**
 * 内部辅助类型，用于过滤 Vue 的内置通用 Props（如 key, class, style, onVnodeMounted 等）
 */
export type VueReservedProps =
  | keyof VNodeProps
  | keyof AllowedComponentProps
  | keyof ComponentCustomProps

/**
 * 组件自身的 props（排除 ModalProps 约定的字段，同时也排除 Vue 内置通用字段）
 */
export type ComponentOptions<T extends Component> = Simplify<
  Omit<InferComponentPropsType<T>, keyof ModalProps | VueReservedProps>
>

/**
 * createModal / useModal 的配置选项
 */
export type ModalOptions<T extends Component> = {
  /** 关闭后延迟销毁的毫秒数，留出动画时间（默认 150） */
  destroyDelay?: number
  /** 关闭时是否自动销毁实例（默认 true） */
  destroyOnClose?: boolean
  /** 初始 props，每次 open 时会与传入 props 合并 */
  initOptions?: Partial<ComponentOptions<T>>
  /** 弹窗关闭时的回调 */
  onClose?: () => void
  /** 组件实例（用于继承应用上下文），内部使用 */
  instance?: any
}

/**
 * createModal / useModal 返回的控制器
 */
export type ModalResult<T extends Component> = {
  /** 打开弹窗，传入组件 props */
  open: (options?: ComponentOptions<T>) => void
  /** 隐藏弹窗（不销毁实例） */
  hide: () => void
  /** 销毁弹窗实例 */
  remove: () => void
  /** 异步组件是否正在加载 */
  isLoadingComponent: Ref<boolean>
  /** 获取弹窗组件暴露的实例方法 */
  getInstance?: () => T extends new (...args: any[]) => any
    ? Omit<InstanceType<T>, keyof InferComponentPropsType<T> | keyof ComponentPublicInstance>
    : any
}

/**
 * 组件参数，支持直接传入组件或懒加载函数
 */
export type MaybeComponent<T> = T | (() => Promise<{ default: T }>)
