import {
  type Component,
  type ComponentPublicInstance,
  type Ref,
  getCurrentInstance,
  h,
  onBeforeUnmount,
  reactive,
  ref,
  watch,
} from 'vue'
import type {
  ComponentOptions,
  MaybeComponent,
  ModalOptions,
  ModalResult,
} from './types'
import { mountComponent } from './mount'
import { getModalKitConfig } from './config'

// ============================================================
// useExpose — 向外暴露方法（绕过 defineExpose）
// ============================================================

/**
 * 将方法挂载到当前组件实例上，使父组件可通过 ref 调用
 *
 * @example
 * ```ts
 * useExpose({ validate, reset })
 * ```
 */
export function useExpose<T = Record<string, any>>(apis: T): void {
  const instance = getCurrentInstance()
  if (instance) {
    Object.assign(instance.proxy as object, apis)
  }
}

// ============================================================
// useModalState — 弹窗内部状态管理
// ============================================================

/**
 * 管理弹窗的 visible 状态、打开/关闭逻辑，以及实例绑定
 * 通常在弹窗组件内部使用
 *
 * @param initOptions - 初始选项，会合并到 state 中
 */
export function useModalState(initOptions: Record<string, unknown>) {
  const state = reactive<{
    visible: boolean
    [key: string]: any
  }>({
    visible: false,
    ...initOptions,
  })

  let openCbList: Array<() => void> = []

  const toggle = (visible: boolean) => {
    state.visible = visible
  }

  const open = (options: Record<string, any> = {}) => {
    Object.assign(state, options)
    toggle(true)
    openCbList.forEach((cb) => cb())
  }

  const close = () => toggle(false)

  // 弹窗组件实例引用
  const instanceRef = ref<ComponentPublicInstance>()
  const bindInstance = (r: any) => {
    instanceRef.value = r
  }
  const getInstance = () => {
    return instanceRef.value
  }

  /**
   * 注册弹窗打开时的回调，返回取消注册函数
   * 修复了原始实现中 splice 索引闭包捕获的 bug
   */
  const onModalOpen = (fn: () => void) => {
    if (!openCbList.includes(fn)) {
      openCbList.push(fn)
    }
    return () => {
      const index = openCbList.indexOf(fn)
      if (index !== -1) {
        openCbList.splice(index, 1)
      }
    }
  }

  // 向外暴露控制方法
  useExpose({ open, close, toggle, getInstance })

  return {
    open,
    close,
    state,
    toggle,
    bindInstance,
    getInstance,
    onModalOpen,
  }
}


// ============================================================
// initInstance — 内部函数，创建弹窗包裹组件并挂载
// ============================================================

function initInstance(
  Comp: Component,
  options: Record<string, unknown>,
  {
    onClose,
    instance,
  }: {
    onClose?: () => void
    instance?: any
  },
) {
  const config = getModalKitConfig()

  const Wrapper = {
    name: 'ModalKitWrapper',
    setup() {
      const { state, toggle, bindInstance, onModalOpen } = useModalState(options)

      // 监听 visible 变化，关闭时触发 onClose
      watch(
        () => state.visible,
        (visible) => {
          if (!visible) {
            onClose?.()
          }
        },
      )

      return () => {
        const modalNode = h(Comp, {
          ...state,
          'onUpdate:visible': toggle,
          ref: bindInstance,
          onModalOpen,
        })

        // 如果配置了根包裹组件（如 ConfigProvider），用它包裹
        if (config.mountRootComponent) {
          return h(config.mountRootComponent, null, { default: () => modalNode })
        }

        return modalNode
      }
    },
  }

  return mountComponent(Wrapper, { instance })
}

// ============================================================
// createModal — 工厂函数，创建可复用的弹窗控制器
// ============================================================

/**
 * 创建一个弹窗控制器（不绑定组件生命周期）
 * 适合在非组件上下文中使用，需手动调用 remove() 销毁
 *
 * @param component - 弹窗组件或懒加载函数
 * @param options - 配置选项
 *
 * @example
 * ```ts
 * const confirmModal = createModalController(ConfirmDialog, {
 *   destroyOnClose: true,
 *   onClose: () => console.log('关闭了'),
 * })
 *
 * confirmModal.open({ title: '确认删除？', content: '此操作不可撤销' })
 * ```
 */
export function createModalController<T extends Component>(
  component: MaybeComponent<T>,
  options: ModalOptions<T> = {},
): ModalResult<T> {
  let ctx: any = null

  const finalOptions: Required<
    Pick<ModalOptions<T>, 'destroyOnClose' | 'destroyDelay'>
  > &
    ModalOptions<T> = {
    destroyOnClose: true,
    destroyDelay: 150,
    ...options,
  }

  const isLoadingComponent = ref(false)

  const open = (openOptions: ComponentOptions<T> = {} as ComponentOptions<T>) => {
    // 正在加载异步组件时，忽略重复调用
    if (isLoadingComponent.value) return

    const mergedOptions = {
      ...finalOptions.initOptions,
      ...openOptions,
    }

    if (ctx) {
      // 实例已存在，直接更新 props 并重新打开
      ctx.instance.open(Object.assign({}, mergedOptions))
    } else {
      const bootstrap = (resolvedComponent: Component) => {
        ctx = initInstance(resolvedComponent, mergedOptions, {
          instance: finalOptions.instance || null,
          onClose() {
            finalOptions.onClose?.()

            if (finalOptions.destroyOnClose) {
              if (!ctx) return
              const { unmount } = ctx
              ctx = null
              // 延迟销毁，等待关闭动画完成
              setTimeout(() => {
                unmount()
              }, finalOptions.destroyDelay)
            }
          },
        })
        ctx.instance.open()
      }

      if (typeof component === 'function') {
        // 先探测此函数是否是动态 import () => import(...)
        // 传入一个空对象 {} 防止如果是普通的 Vue 函数式组件 (props) => h(...) 时因解构 props 引发报错崩溃
        let isAsync = true
        let result: any
        try {
          result = (component as any)({}) 
          if (!result || typeof result.then !== 'function') {
            isAsync = false
          }
        } catch (e) {
          // 如果尝试调用时发生同步错误，则说明它是依赖特定参数的普通函数式组件，而非动态 import
          isAsync = false
        }

        if (isAsync) {
          // 确定为异步加载组件
          isLoadingComponent.value = true
          const config = getModalKitConfig()
          config.beforeLoading?.()
          
          result
            .then((res: { default: Component }) => {
              bootstrap(res.default)
            })
            .catch((err: Error) => {
              config.showMessage?.('加载组件失败')
              throw err
            })
            .finally(() => {
              isLoadingComponent.value = false
              config.afterLoading?.()
            })
        } else {
          // 是个普通的函数式组件，直接执行挂载
          bootstrap(component as Component)
        }
      } else {
        bootstrap(component as Component)
      }
    }
  }

  const hide = () => {
    ctx?.instance?.toggle(false)
  }

  const remove = () => {
    if (ctx) {
      ctx.unmount()
      ctx = null
    }
  }

  return {
    open,
    hide,
    remove,
    isLoadingComponent,
    getInstance: () => ctx?.instance?.getInstance(),
  }
}

// ============================================================
// useModal — 组合式 API，自动绑定组件生命周期
// ============================================================

/**
 * 在组件 setup 中使用的弹窗 hook，自动在组件卸载时销毁弹窗
 *
 * @param component - 弹窗组件或懒加载函数
 * @param options - 配置选项
 *
 * @example
 * ```vue
 * <script setup>
 * import { useModalController } from 'modalkit'
 * import EditUserModal from './EditUserModal.vue'
 *
 * const { open } = useModalController(EditUserModal)
 *
 * const handleEdit = (user) => {
 *   open({ userId: user.id, userName: user.name })
 * }
 * </script>
 * ```
 */
export function useModalController<T extends Component>(
  component: MaybeComponent<T>,
  options: ModalOptions<T> = {},
): ModalResult<T> {
  const instance = getCurrentInstance()

  const result = createModalController(component, {
    instance,
    ...options,
  })

  // 组件卸载时自动销毁弹窗实例
  onBeforeUnmount(() => {
    result.remove()
  })

  return result
}
