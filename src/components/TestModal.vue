<script setup lang="ts">


const visible = defineModel<boolean>('visible', { default: false })

const props = defineProps<{
  onModalOpen?: (fn: () => void) => () => void
  title?: string
  content?: string
}>()
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="visible = false">
      <div class="modal-container">
        <div class="modal-header">
          <h3>{{ title || '默认标题' }}</h3>
          <button class="modal-close" @click="visible = false">✕</button>
        </div>
        <div class="modal-body">
          <p>{{ content || '这是一个通过 modalkit 命令式调用的弹窗' }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" @click="visible = false">确定</button>
          <button class="btn btn-secondary" @click="visible = false">取消</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease;
}

.modal-container {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  min-width: 400px;
  max-width: 90vw;
  animation: slideUp 0.25s ease;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 12px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.modal-close {
  border: none;
  background: none;
  font-size: 18px;
  cursor: pointer;
  color: #999;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.15s;
}

.modal-close:hover {
  background: #f5f5f5;
  color: #333;
}

.modal-body {
  padding: 20px 24px;
  color: #555;
  line-height: 1.6;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px 24px 20px;
}

.btn {
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid transparent;
}

.btn-primary {
  background: #4f46e5;
  color: #fff;
}

.btn-primary:hover {
  background: #4338ca;
}

.btn-secondary {
  background: #f5f5f5;
  color: #555;
  border-color: #e0e0e0;
}

.btn-secondary:hover {
  background: #eee;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
