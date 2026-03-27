import { createApp, type Component, type ComponentInternalInstance, type ComponentPublicInstance } from 'vue'
import { getRootAppContext } from './config'

interface MountComponentOptions {
  /** 当前组件实例，用于继承上下文 */
  instance?: ComponentInternalInstance | null
}

interface MountedComponent {
  /** 挂载后的组件实例 */
  instance: ComponentPublicInstance
  /** 卸载组件并移除 DOM 节点 */
  unmount: () => void
}

/**
 * 将组件动态挂载到 document.body 上
 *
 * 核心能力：继承宿主应用的完整上下文（provides、directives、components 等），
 * 使命令式创建的组件也能正常使用 inject、全局组件、自定义指令。
 *
 * @param RootComponent - 要挂载的组件
 * @param options - 挂载选项
 */
export function mountComponent(
  RootComponent: Component,
  options: MountComponentOptions = {},
): MountedComponent {
  const app = createApp(RootComponent)

  if (options.instance) {
    const instance = options.instance as any
    const appCtx = instance.appContext

    Object.assign(app._context, {
      directives: { ...appCtx.directives },
      components: { ...appCtx.components },
      mixins: [...(appCtx.mixins || [])],
      config: appCtx.config,
      // 修复 provides 覆盖与 Symbol key 失效 Bug：直接继承 prototype chain
      provides: Object.create(instance.provides || appCtx.provides || {}),
    })
  } else {
    // 没有传入实例时，回退到全局根应用上下文
    const ctx = getRootAppContext()
    if (ctx) {
      Object.assign(app._context, {
        directives: ctx.directives,
        components: ctx.components,
        mixins: ctx.mixins,
        config: ctx.config,
        provides: ctx.provides,
      })
    }
  }

  const root = document.createElement('div')
  document.body.appendChild(root)

  let unmounted = false

  return {
    instance: app.mount(root),
    unmount() {
      if (unmounted) return
      unmounted = true
      app.unmount()
      document.body.removeChild(root)
    },
  }
}
