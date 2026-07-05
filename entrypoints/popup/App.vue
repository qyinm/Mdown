<script lang="ts" setup>
import { ref } from 'vue';
import IconOpenAI from '@/components/IconOpenAI.vue';
import IconClaude from '@/components/IconClaude.vue';
import IconGemini from '@/components/IconGemini.vue';
import { toJsonBody } from '@/lib/types';
import type { ExtractionResult, ArticleData } from '@/lib/types';

type Status = 'idle' | 'loading' | 'success' | 'error';
type Format = 'markdown' | 'json';
type ExportTarget = 'chatgpt' | 'claude' | 'gemini';

const status = ref<Status>('idle');
const format = ref<Format>('markdown');
const loadingAction = ref('');
const successMessage = ref('');
const errorMessage = ref('');

const aiTargets = [
  { target: 'chatgpt' as const, label: 'ChatGPT', icon: IconOpenAI, class: 'btn-chatgpt' },
  { target: 'claude' as const, label: 'Claude', icon: IconClaude, class: 'btn-claude' },
  { target: 'gemini' as const, label: 'Gemini', icon: IconGemini, class: 'btn-gemini' },
];

async function extractMarkdown(): Promise<ArticleData> {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tab.id) throw new Error('No active tab');

  await browser.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['/injected.js'],
  });

  const result: ExtractionResult = await browser.tabs.sendMessage(tab.id, { action: 'extract' });
  if ('error' in result) throw new Error(result.error);
  return result;
}

function getActiveText(result: ArticleData): string {
  return format.value === 'json' ? toJsonBody(result) : result.markdownWithMeta;
}

function getFileExt(): string {
  return format.value === 'json' ? '.json' : '.md';
}

async function runAction(action: string, fn: () => Promise<string>) {
  status.value = 'loading';
  loadingAction.value = action;
  errorMessage.value = '';
  try {
    successMessage.value = await fn();
    status.value = 'success';
  } catch (e) {
    status.value = 'error';
    errorMessage.value = e instanceof Error ? e.message : 'Unknown error';
  }
}

async function handleCopy() {
  await runAction('copy', async () => {
    const result = await extractMarkdown();
    await navigator.clipboard.writeText(getActiveText(result));
    return 'Copied to clipboard';
  });
}

async function handleSave() {
  await runAction('save', async () => {
    const result = await extractMarkdown();
    await browser.runtime.sendMessage({
      action: 'download',
      title: result.title,
      content: getActiveText(result),
      ext: getFileExt(),
    });
    return `Saved as ${getFileExt()} file`;
  });
}

async function handleExport(target: ExportTarget) {
  const label = aiTargets.find((t) => t.target === target)?.label ?? target;
  await runAction(target, async () => {
    const { markdownWithMeta } = await extractMarkdown();
    await browser.runtime.sendMessage({ action: 'export', markdown: markdownWithMeta, target });
    return `Opened in ${label}`;
  });
}
</script>

<template>
  <div class="container">
    <div class="header">
      <h1>Mdown</h1>
      <p class="description">Save this page as Markdown</p>
    </div>

    <div class="format-bar">
      <span class="format-label">Format</span>
      <div class="format-toggle">
        <button
          class="toggle-btn"
          :class="{ active: format === 'markdown' }"
          :disabled="status === 'loading'"
          @click="format = 'markdown'"
        >Markdown</button>
        <button
          class="toggle-btn"
          :class="{ active: format === 'json' }"
          :disabled="status === 'loading'"
          @click="format = 'json'"
        >JSON</button>
      </div>
    </div>

    <div class="actions">
      <button
        class="btn btn-primary"
        :disabled="status === 'loading'"
        @click="handleCopy"
      >
        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
        <span v-if="status === 'loading' && loadingAction === 'copy'">Copying...</span>
        <span v-else>Copy</span>
      </button>

      <button
        class="btn btn-secondary"
        :disabled="status === 'loading'"
        @click="handleSave"
      >
        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        <span v-if="status === 'loading' && loadingAction === 'save'">Saving...</span>
        <span v-else>Save</span>
      </button>
    </div>

    <div class="divider">
      <span class="divider-text">Export to AI</span>
    </div>

    <div class="ai-grid">
      <button
        v-for="ai in aiTargets"
        :key="ai.target"
        class="btn btn-ai"
        :class="ai.class"
        :disabled="status === 'loading'"
        @click="handleExport(ai.target)"
      >
        <component :is="ai.icon" class="btn-icon" />
        <span v-if="status === 'loading' && loadingAction === ai.target">Opening...</span>
        <span v-else>{{ ai.label }}</span>
      </button>
    </div>

    <Transition name="fade">
      <p v-if="status === 'success'" class="toast success">
        <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        {{ successMessage }}
      </p>
      <p v-else-if="status === 'error'" class="toast error">
        <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
        {{ errorMessage }}
      </p>
    </Transition>
  </div>
</template>

<style scoped>
.container {
  width: 260px;
  padding: 20px;
}

/* Header */
.header {
  margin-bottom: 16px;
}

h1 {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 700;
  color: #111;
  letter-spacing: -0.3px;
}

.description {
  margin: 0;
  color: #888;
  font-size: 13px;
}

/* Format selector */
.format-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.format-label {
  font-size: 11px;
  font-weight: 500;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.format-toggle {
  display: flex;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.toggle-btn {
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  background: transparent;
  color: #888;
  transition: all 0.12s ease;
  line-height: 1;
}

.toggle-btn.active {
  background: #333;
  color: white;
}

.toggle-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Action buttons */
.actions {
  display: flex;
  gap: 8px;
}

.btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
  line-height: 1;
}

.btn-icon {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
}

.btn-primary {
  color: white;
  background: #333;
}

.btn-primary:hover:not(:disabled) {
  background: #111;
}

.btn-secondary {
  color: #333;
  background: #f0f0f0;
}

.btn-secondary:hover:not(:disabled) {
  background: #e4e4e4;
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Divider */
.divider {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 14px 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e8e8e8;
}

.divider-text {
  font-size: 11px;
  font-weight: 500;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

/* AI button grid */
.ai-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.ai-grid .btn {
  flex: unset;
  padding: 9px 12px;
  font-size: 12px;
}

.ai-grid .btn:last-child:nth-child(odd) {
  grid-column: 1 / -1;
}

/* AI buttons */
.btn-ai {
  background: #fafafa;
  border: 1px solid #e8e8e8;
  color: #444;
  font-weight: 500;
}

.btn-chatgpt:hover:not(:disabled) {
  background: #f0faf0;
  border-color: #74aa9c;
  color: #2d7a5f;
}

.btn-claude:hover:not(:disabled) {
  background: #fef6f2;
  border-color: #D97757;
  color: #b85c3a;
}

.btn-gemini:hover:not(:disabled) {
  background: #eff6ff;
  border-color: #3186FF;
  color: #1d5cc7;
}

/* Toast messages */
.toast {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
}

.toast-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.toast.success {
  background: #f0fdf4;
  color: #16a34a;
}

.toast.error {
  background: #fef2f2;
  color: #dc2626;
}

/* Transitions */
.fade-enter-active {
  transition: all 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}
</style>