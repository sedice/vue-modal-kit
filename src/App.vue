<script setup lang="ts">
import { useModalController } from './core'
import TestModal from './components/TestModal.vue'
import { getCurrentInstance } from 'vue'

// 演示 useModalController 用法
const { open, hide, isLoadingComponent } = useModalController(TestModal)

// 演示懒加载用法
const { open: openLazy, isLoadingComponent: isLazyLoading } = useModalController(
  () => import('./components/TestModal.vue'),
)


</script>

<template>
  <div class="app">
    <header class="hero">
      <h1>📦 Modalkit</h1>
      <p class="subtitle">Vue 3 命令式弹窗工具库</p>
    </header>

    <main class="demo-area">
      <section class="demo-card">
        <h2>基础用法</h2>
        <p>通过 <code>useModalController</code> 创建弹窗控制器，调用 <code>open()</code> 打开弹窗</p>
        <button class="demo-btn" @click="open({ title: '基础弹窗', content: '通过 useModalController + open() 命令式调用' })">
          打开弹窗
        </button>
      </section>

      <section class="demo-card">
        <h2>自定义 Props</h2>
        <p>通过 <code>open(options)</code> 传递任意 props</p>
        <button class="demo-btn" @click="open({ title: '自定义标题', content: '这里是自定义的内容，通过 open 的参数传入 🎉' })">
          打开自定义弹窗
        </button>
      </section>

      <section class="demo-card">
        <h2>懒加载</h2>
        <p>使用 <code>() =&gt; import(...)</code> 实现组件的按需加载</p>
        <button
          class="demo-btn"
          :disabled="isLazyLoading"
          @click="openLazy({ title: '懒加载弹窗', content: '此弹窗组件是异步加载的！' })"
        >
          {{ isLazyLoading ? '加载中...' : '打开懒加载弹窗' }}
        </button>
      </section>
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: #1a1a1a;
}

.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 60px 24px;
}

.hero {
  text-align: center;
  margin-bottom: 48px;
}

.hero h1 {
  font-size: 48px;
  font-weight: 800;
  color: #fff;
  margin-bottom: 8px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.85);
}

.demo-area {
  display: grid;
  gap: 20px;
}

.demo-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 28px 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.demo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.demo-card h2 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #1a1a1a;
}

.demo-card p {
  color: #666;
  margin-bottom: 16px;
  line-height: 1.5;
}

.demo-card code {
  background: #f0edff;
  color: #4f46e5;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 13px;
  font-family: 'Fira Code', monospace;
}

.demo-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);
}

.demo-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(79, 70, 229, 0.5);
}

.demo-btn:active {
  transform: translateY(0);
}

.demo-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
</style>
