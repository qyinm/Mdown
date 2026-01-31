<script lang="ts" setup>
import { ref } from 'vue';

const status = ref<'idle' | 'loading' | 'copied' | 'saved' | 'error'>('idle');
const errorMessage = ref('');

async function extractMarkdown(): Promise<{ title: string; markdown: string }> {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tab.id) throw new Error('No active tab');

  // Inject content script dynamically
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
</script>

<template>
  <div class="container">
    <h1>Mdown</h1>
    <p class="description">Save this page as Markdown</p>

    <div class="buttons">
      <button
        class="btn btn-primary"
        :disabled="status === 'loading'"
        @click="handleCopy"
      >
        <span v-if="status === 'loading'">...</span>
        <span v-else>Copy</span>
      </button>

      <button
        class="btn btn-secondary"
        :disabled="status === 'loading'"
        @click="handleSave"
      >
        <span v-if="status === 'loading'">...</span>
        <span v-else>Save</span>
      </button>
    </div>

    <p v-if="status === 'copied'" class="success">Copied to clipboard!</p>
    <p v-if="status === 'saved'" class="success">Saved successfully!</p>
    <p v-if="status === 'error'" class="error">{{ errorMessage }}</p>
  </div>
</template>

<style scoped>
.container {
  width: 240px;
  padding: 20px;
  text-align: center;
}

h1 {
  margin: 0 0 8px;
  font-size: 24px;
  color: #333;
}

.description {
  margin: 0 0 16px;
  color: #666;
  font-size: 14px;
}

.buttons {
  display: flex;
  gap: 8px;
}

.btn {
  flex: 1;
  padding: 12px 16px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary {
  color: white;
  background: #4a9eff;
}

.btn-primary:hover:not(:disabled) {
  background: #3a8eef;
}

.btn-secondary {
  color: #333;
  background: #e5e7eb;
}

.btn-secondary:hover:not(:disabled) {
  background: #d1d5db;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.success {
  margin-top: 12px;
  color: #22c55e;
  font-size: 14px;
}

.error {
  margin-top: 12px;
  color: #ef4444;
  font-size: 14px;
}
</style>
