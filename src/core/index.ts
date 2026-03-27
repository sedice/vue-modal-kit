// ============================================================
// Modalkit — Vue 3 命令式弹窗工具库
// ============================================================

// 核心 API
export { useModalController, createModalController } from './modal'

// 配置与插件
export { createModalKit, setModalKitConfig, getModalKitConfig, setRootAppContext } from './config'


// 类型导出
export type {
  ModalProps,
  ModalOptions,
  ModalResult,
  ComponentOptions,
  MaybeComponent,
  InferComponentPropsType,
} from './types'

export type { ModalKitConfig } from './config'
