<script lang="ts" setup>
import { ref } from 'vue';

const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle');
const errorMessage = ref('');

async function handleClip() {
  status.value = 'loading';
  errorMessage.value = '';

  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) throw new Error('No active tab');

    const result = await browser.tabs.sendMessage(tab.id, { action: 'extract' });

    if ('error' in result) {
      throw new Error(result.error);
    }

    await browser.runtime.sendMessage({
      action: 'download',
      title: result.title,
      markdown: result.markdown,
    });

    status.value = 'success';
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

    <button
      class="clip-button"
      :disabled="status === 'loading'"
      @click="handleClip"
    >
      <span v-if="status === 'loading'">Extracting...</span>
      <span v-else>Save as Markdown</span>
    </button>

    <p v-if="status === 'success'" class="success">Saved successfully!</p>
    <p v-if="status === 'error'" class="error">{{ errorMessage }}</p>
  </div>
</template>

<style scoped>
.container {
  width: 280px;
  padding: 20px;
  text-align: center;
}

h1 {
  margin: 0 0 8px;
  font-size: 24px;
  color: #333;
}

.description {
  margin: 0 0 20px;
  color: #666;
  font-size: 14px;
}

.clip-button {
  width: 100%;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  background: #4a9eff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.clip-button:hover:not(:disabled) {
  background: #3a8eef;
}

.clip-button:disabled {
  background: #ccc;
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
