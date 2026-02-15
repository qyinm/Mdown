<script lang="ts" setup>
import { ref } from 'vue';
import IconOpenAI from '@/components/IconOpenAI.vue';
import IconClaude from '@/components/IconClaude.vue';
import IconGemini from '@/components/IconGemini.vue';

type Status = 'idle' | 'loading' | 'copied' | 'saved' | 'exported-chatgpt' | 'exported-claude' | 'exported-gemini' | 'error';

const status = ref<Status>('idle');
const loadingAction = ref<string>('');
const errorMessage = ref('');

async function extractMarkdown(): Promise<{ title: string; markdown: string }> {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tab.id) throw new Error('No active tab');

  await browser.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['/injected.js'],
  });

  const result = await browser.tabs.sendMessage(tab.id, { action: 'extract' });

  if ('error' in result) {
    throw new Error(result.error);
  }

  return result;
}

async function handleCopy() {
  status.value = 'loading';
  loadingAction.value = 'copy';
  errorMessage.value = '';

  try {
    const { markdown } = await extractMarkdown();
    await navigator.clipboard.writeText(markdown);
    status.value = 'copied';
  } catch (e) {
    status.value = 'error';
    errorMessage.value = e instanceof Error ? e.message : 'Unknown error';
  }
}

async function handleSave() {
  status.value = 'loading';
  loadingAction.value = 'save';
  errorMessage.value = '';

  try {
    const { title, markdown } = await extractMarkdown();
    await browser.runtime.sendMessage({
      action: 'download',
      title,
      markdown,
    });
    status.value = 'saved';
  } catch (e) {
    status.value = 'error';
    errorMessage.value = e instanceof Error ? e.message : 'Unknown error';
  }
}

async function handleExportChatGPT() {
  status.value = 'loading';
  loadingAction.value = 'chatgpt';
  errorMessage.value = '';

  try {
    const { markdown } = await extractMarkdown();
    await browser.runtime.sendMessage({
      action: 'export',
      markdown,
      target: 'chatgpt',
    });
    status.value = 'exported-chatgpt';
  } catch (e) {
    status.value = 'error';
    errorMessage.value = e instanceof Error ? e.message : 'Unknown error';
  }
}

async function handleExportClaude() {
  status.value = 'loading';
  loadingAction.value = 'claude';
  errorMessage.value = '';

  try {
    const { markdown } = await extractMarkdown();
    await browser.runtime.sendMessage({
      action: 'export',
      markdown,
      target: 'claude',
    });
    status.value = 'exported-claude';
  } catch (e) {
    status.value = 'error';
    errorMessage.value = e instanceof Error ? e.message : 'Unknown error';
  }
}

async function handleExportGemini() {
  status.value = 'loading';
  loadingAction.value = 'gemini';
  errorMessage.value = '';

  try {
    const { markdown } = await extractMarkdown();
    await browser.runtime.sendMessage({
      action: 'export',
      markdown,
      target: 'gemini',
    });
    status.value = 'exported-gemini';
  } catch (e) {
    status.value = 'error';
    errorMessage.value = e instanceof Error ? e.message : 'Unknown error';
  }
}
</script>

<template>
  <div class="container">
    <div class="header">
      <h1>Mdown</h1>
      <p class="description">Save this page as Markdown</p>
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
        class="btn btn-ai btn-chatgpt"
        :disabled="status === 'loading'"
        @click="handleExportChatGPT"
      >
        <IconOpenAI class="btn-icon" />
        <span v-if="status === 'loading' && loadingAction === 'chatgpt'">Opening...</span>
        <span v-else>ChatGPT</span>
      </button>

      <button
        class="btn btn-ai btn-claude"
        :disabled="status === 'loading'"
        @click="handleExportClaude"
      >
        <IconClaude class="btn-icon" />
        <span v-if="status === 'loading' && loadingAction === 'claude'">Opening...</span>
        <span v-else>Claude</span>
      </button>

      <button
        class="btn btn-ai btn-gemini"
        :disabled="status === 'loading'"
        @click="handleExportGemini"
      >
        <IconGemini class="btn-icon" />
        <span v-if="status === 'loading' && loadingAction === 'gemini'">Opening...</span>
        <span v-else>Gemini</span>
      </button>
    </div>

    <Transition name="fade">
      <p v-if="status === 'copied'" class="toast success">
        <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        Copied to clipboard
      </p>
      <p v-else-if="status === 'saved'" class="toast success">
        <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        Saved as .md file
      </p>
      <p v-else-if="status === 'exported-chatgpt'" class="toast success">
        <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        Opened in ChatGPT
      </p>
      <p v-else-if="status === 'exported-claude'" class="toast success">
        <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        Opened in Claude
      </p>
      <p v-else-if="status === 'exported-gemini'" class="toast success">
        <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        Opened in Gemini
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
