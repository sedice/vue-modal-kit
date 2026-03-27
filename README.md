# Modalkit

Vue 3 命令式弹窗工具库 — 类型安全、上下文继承、懒加载支持。

[中文文档](./README.zh-CN.md)

## ✨ 特性

- 🚀 **命令式调用** — 像调用函数一样打开弹窗，告别模板中的 `v-model` 和状态管理
- 🔗 **上下文继承** — 自动继承宿主应用的 `provide/inject`、全局组件、指令、配置
- 📦 **懒加载** — 支持 `() => import(...)` 按需加载弹窗组件
- 🛡️ **类型安全** — 完整的 TypeScript 支持，`open()` 参数自动推导
- 🪶 **零依赖** — 仅需 `vue >= 3.3` 作为 peerDependency
- 🎯 **自动销毁** — `useModalController` 在组件卸载时自动清理

## 📦 安装

```bash
npm install modalkit
# 或
pnpm add modalkit
```

## 🚀 快速开始

### 1. 注册插件（可选）

```ts
import { createApp } from 'vue'
import { createModalKit } from 'modalkit'
import App from './App.vue'

const app = createApp(App)

app.use(createModalKit({
  // 可选的全局配置
  showMessage: (msg) => console.warn(msg),
}))

app.mount('#app')
```

### 2. 创建一个弹窗组件

```vue
<!-- EditUserModal.vue -->
<script setup lang="ts">
import type { ModalProps } from 'modalkit'
import { defineModel } from 'vue'

// 使用 Vue 3.4+ 原生的 defineModel 实现可见性的双向绑定
const visible = defineModel<boolean>('visible', { default: false })

const props = defineProps<ModalProps & {
  userId: number
  userName: string
}>()
</script>

<template>
  <!-- 用任何 UI 库的 Dialog/Modal 组件 -->
  <el-dialog v-model="visible" title="编辑用户">
    <p>用户ID: {{ userId }}</p>
    <p>用户名: {{ userName }}</p>
  </el-dialog>
</template>
```

### 3. 命令式调用

```vue
<script setup lang="ts">
import { useModalController } from 'modalkit'
import EditUserModal from './EditUserModal.vue'

const { open } = useModalController(EditUserModal)

const handleEdit = (user) => {
  open({ userId: user.id, userName: user.name })
}
</script>
```

## 📖 API

### `useModalController(component, options?)`

在组件 `setup` 中使用，组件卸载时自动销毁弹窗。

```ts
const { open, hide, remove, isLoadingComponent, getInstance } = useModalController(MyModal)
```

### `createModalController(component, options?)`

工厂函数，不绑定组件生命周期，需手动调用 `remove()` 销毁。

```ts
const modal = createModalController(MyModal, { destroyOnClose: true })
modal.open({ title: 'Hello' })
modal.remove() // 手动销毁
```

### `useModalState(initOptions)`

在弹窗组件内部使用，管理弹窗状态。

```ts
const { state, open, close, toggle, bindInstance, getInstance } = useModalState({})
```


### `createModalKit(config?)`

Vue 插件，注册全局配置。

### Options

| 选项 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `destroyOnClose` | `boolean` | `true` | 关闭后是否自动销毁实例 |
| `destroyDelay` | `number` | `150` | 销毁延迟（ms），留出关闭动画时间 |
| `initOptions` | `object` | — | 初始 props，每次 open 时合并 |
| `onClose` | `() => void` | — | 关闭回调 |

### 返回值

| 属性 | 类型 | 说明 |
|---|---|---|
| `open` | `(options?) => void` | 打开弹窗，传入 props |
| `hide` | `() => void` | 隐藏弹窗（不销毁） |
| `remove` | `() => void` | 销毁弹窗实例 |
| `isLoadingComponent` | `Ref<boolean>` | 异步组件加载状态 |
| `getInstance` | `() => T` | 获取弹窗暴露的实例方法 |

## 🔧 高级用法

### 懒加载弹窗

```ts
const { open } = useModal(() => import('./HeavyModal.vue'))
```

### 全局根组件包裹

如果你的弹窗需要 `ConfigProvider` 等上下文包裹：

```ts
import { ConfigProvider } from 'ant-design-vue'

app.use(createModalKit({
  mountRootComponent: ConfigProvider,
}))
```

### 组件外使用

```ts
// utils/modals.ts
import { createModal } from 'modalkit'
import ConfirmModal from './ConfirmModal.vue'

export const confirmModal = createModal(ConfirmModal, {
  destroyOnClose: true,
})

// 任意位置调用
confirmModal.open({ title: '确认删除？' })
```

## 📄 License

[MIT](./LICENSE)
