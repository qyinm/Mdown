<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue';
import IconOpenAI from '@/components/IconOpenAI.vue';
import IconClaude from '@/components/IconClaude.vue';
import IconGemini from '@/components/IconGemini.vue';
import {
  buildMarkdownOutput,
  toJsonOutput,
  fieldsFromArticle,
} from '@/lib/types';
import type { ExtractionResult, ArticleData, ClipFields } from '@/lib/types';

type Status = 'loading' | 'ready' | 'error' | 'busy';
type Format = 'markdown' | 'json';
type ExportTarget = 'chatgpt' | 'claude' | 'gemini';

const status = ref<Status>('loading');
const format = ref<Format>('markdown');
const busyAction = ref('');
const copied = ref(false);
const dirty = ref(false);
const errorMessage = ref('');
const article = ref<ArticleData | null>(null);
const fields = ref<ClipFields>({ title: '', source: '', date: '', description: '', site: '' });
const previewText = ref('');
let copyTimer: ReturnType<typeof setTimeout> | undefined;

const aiTargets = [
  { target: 'chatgpt' as const, label: 'ChatGPT', icon: IconOpenAI, class: 'btn-chatgpt' },
  { target: 'claude' as const, label: 'Claude', icon: IconClaude, class: 'btn-claude' },
  { target: 'gemini' as const, label: 'Gemini', icon: IconGemini, class: 'btn-gemini' },
];

const propertyFields = computed(() => [
  { icon: 'source', label: 'source', key: 'source' as const, type: 'url' },
  { icon: 'created', label: 'created', key: 'date' as const, type: 'date' },
  { icon: 'description', label: 'description', key: 'description' as const, type: 'text' },
  { icon: 'site', label: 'site', key: 'site' as const, type: 'text' },
]);

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

function syncFromArticle(data: ArticleData) {
  fields.value = fieldsFromArticle(data);
  previewText.value = format.value === 'json' ? toJsonOutput(fields.value, data.markdown) : data.markdown;
  dirty.value = false;
}

function getOutputText(): string {
  if (format.value === 'json') return previewText.value;
  return buildMarkdownOutput(fields.value, previewText.value);
}

function getFileExt(): string {
  return format.value === 'json' ? '.json' : '.md';
}

async function copyOutput() {
  if (!article.value) return;
  await navigator.clipboard.writeText(getOutputText());
  copied.value = true;
  dirty.value = false;
}

function onContentChange() {
  dirty.value = true;
  copied.value = false;
  clearTimeout(copyTimer);
  copyTimer = setTimeout(() => {
    copyOutput().catch(() => { copied.value = false; });
  }, 600);
}

async function loadAndCopy() {
  status.value = 'loading';
  errorMessage.value = '';
  copied.value = false;
  dirty.value = false;
  try {
    article.value = await extractMarkdown();
    syncFromArticle(article.value);
    await copyOutput();
    status.value = 'ready';
  } catch (e) {
    status.value = 'error';
    errorMessage.value = e instanceof Error ? e.message : 'Unknown error';
  }
}

onMounted(loadAndCopy);

watch(format, async (_newFmt, oldFmt) => {
  if (!article.value || status.value !== 'ready' || oldFmt === undefined) return;
  if (format.value === 'json') {
    previewText.value = toJsonOutput(fields.value, previewText.value);
  } else {
    try {
      const parsed = JSON.parse(previewText.value) as Record<string, string>;
      fields.value = {
        title: parsed.title ?? fields.value.title,
        source: parsed.url ?? fields.value.source,
        date: (parsed.date ?? fields.value.date).split('T')[0],
        description: parsed.excerpt ?? fields.value.description,
        site: parsed.siteName ?? fields.value.site,
      };
      if (typeof parsed.content === 'string') previewText.value = parsed.content;
    } catch { /* keep markdown body */ }
  }
  dirty.value = false;
  try {
    await copyOutput();
  } catch {
    copied.value = false;
  }
});

async function runBusy(action: string, fn: () => Promise<void>) {
  busyAction.value = action;
  status.value = 'busy';
  errorMessage.value = '';
  try {
    await fn();
    status.value = 'ready';
  } catch (e) {
    status.value = 'error';
    errorMessage.value = e instanceof Error ? e.message : 'Unknown error';
  } finally {
    busyAction.value = '';
  }
}

async function handleSave() {
  if (!article.value) return;
  await runBusy('save', async () => {
    clearTimeout(copyTimer);
    await copyOutput();
    await browser.runtime.sendMessage({
      action: 'download',
      title: fields.value.title,
      content: getOutputText(),
      ext: getFileExt(),
    });
  });
}

async function handleExport(target: ExportTarget) {
  if (!article.value) return;
  await runBusy(target, async () => {
    clearTimeout(copyTimer);
    await copyOutput();
    await browser.runtime.sendMessage({
      action: 'export',
      markdown: getOutputText(),
      target,
    });
  });
}
</script>

<template>
  <div class="container">
    <header class="top-bar">
      <span class="top-label">Clip preview</span>
      <div class="top-actions">
        <span v-if="dirty && status === 'ready'" class="status-badge modified">Modified</span>
        <span v-else-if="copied && status === 'ready'" class="status-badge copied">Copied</span>
        <div class="format-toggle">
          <button
            class="toggle-btn"
            :class="{ active: format === 'markdown' }"
            :disabled="status === 'loading' || status === 'busy'"
            @click="format = 'markdown'"
          >MD</button>
          <button
            class="toggle-btn"
            :class="{ active: format === 'json' }"
            :disabled="status === 'loading' || status === 'busy'"
            @click="format = 'json'"
          >JSON</button>
        </div>
      </div>
    </header>

    <div v-if="status === 'loading'" class="state-box">
      <div class="spinner" />
      <p>Extracting page…</p>
    </div>

    <div v-else-if="status === 'error'" class="state-box error">
      <p>{{ errorMessage }}</p>
      <button class="btn btn-secondary" @click="loadAndCopy">Retry</button>
    </div>

    <template v-else-if="article">
      <input
        v-model="fields.title"
        class="clip-title"
        type="text"
        spellcheck="false"
        placeholder="Title"
        @input="onContentChange"
      >

      <section v-if="format === 'markdown'" class="properties">
        <h2 class="section-label">Properties</h2>
        <dl class="prop-list">
          <div v-for="prop in propertyFields" :key="prop.label" class="prop-row">
            <dt class="prop-key">
              <span class="prop-icon" :data-icon="prop.icon" />
              {{ prop.label }}
            </dt>
            <dd class="prop-value">
              <input
                v-model="fields[prop.key]"
                class="prop-input"
                :type="prop.type"
                spellcheck="false"
                @input="onContentChange"
              >
            </dd>
          </div>
        </dl>
      </section>

      <section class="preview">
        <h2 class="section-label">{{ format === 'json' ? 'JSON' : 'Content' }}</h2>
        <textarea
          v-model="previewText"
          class="preview-body"
          spellcheck="false"
          @input="onContentChange"
        />
      </section>

      <footer class="footer">
        <button
          class="btn btn-primary btn-save"
          :disabled="status === 'busy'"
          @click="handleSave"
        >
          <span v-if="busyAction === 'save'">Saving…</span>
          <span v-else>Save as {{ getFileExt() }}</span>
        </button>

        <div class="ai-row">
          <button
            v-for="ai in aiTargets"
            :key="ai.target"
            class="btn btn-ai"
            :class="ai.class"
            :disabled="status === 'busy'"
            @click="handleExport(ai.target)"
          >
            <component :is="ai.icon" class="btn-icon" />
            <span v-if="busyAction === ai.target">…</span>
            <span v-else>{{ ai.label }}</span>
          </button>
        </div>
      </footer>
    </template>
  </div>
</template>

<style scoped>
.container {
  width: 400px;
  max-height: 560px;
  display: flex;
  flex-direction: column;
  padding: 16px 16px 12px;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.top-label {
  font-size: 12px;
  font-weight: 600;
  color: #666;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-badge {
  font-size: 11px;
  font-weight: 600;
}

.status-badge.copied {
  color: #16a34a;
}

.status-badge.modified {
  color: #d97706;
}

.format-toggle {
  display: flex;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

.toggle-btn {
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  background: transparent;
  color: #888;
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

.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 48px 16px;
  color: #888;
  font-size: 13px;
}

.state-box.error {
  color: #dc2626;
}

.spinner {
  width: 22px;
  height: 22px;
  border: 2px solid #e8e8e8;
  border-top-color: #333;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.clip-title {
  width: 100%;
  margin: 0 0 12px;
  padding: 0;
  border: none;
  background: transparent;
  font-size: 22px;
  font-weight: 700;
  color: #111;
  letter-spacing: -0.3px;
  line-height: 1.25;
  flex-shrink: 0;
}

.clip-title:focus {
  outline: none;
}

.clip-title::placeholder {
  color: #ccc;
}

.section-label {
  margin: 0 0 8px;
  font-size: 11px;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.properties {
  flex-shrink: 0;
  margin-bottom: 12px;
}

.prop-list {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.prop-row {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 8px;
  align-items: start;
  font-size: 12px;
  line-height: 1.4;
}

.prop-key {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  color: #888;
  font-weight: 500;
}

.prop-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  opacity: 0.55;
  background: currentColor;
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
}

.prop-icon[data-icon="title"] { mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2'%3E%3Cpath d='M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z'/%3E%3Cpath d='M14 2v6h6M16 13H8M16 17H8M10 9H8'/%3E%3C/svg%3E"); }
.prop-icon[data-icon="source"] { mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2'%3E%3Cpath d='M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71'/%3E%3Cpath d='M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'/%3E%3C/svg%3E"); }
.prop-icon[data-icon="created"] { mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2'%3E%3Crect x='3' y='4' width='18' height='18' rx='2'/%3E%3Cpath d='M16 2v4M8 2v4M3 10h18'/%3E%3C/svg%3E"); }
.prop-icon[data-icon="description"] { mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2'%3E%3Cpath d='M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z'/%3E%3Cpath d='M14 2v6h6M16 13H8M16 17H8'/%3E%3C/svg%3E"); }
.prop-icon[data-icon="site"] { mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpath d='M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z'/%3E%3C/svg%3E"); }

.prop-value {
  margin: 0;
  min-width: 0;
}

.prop-input {
  width: 100%;
  padding: 4px 6px;
  border: 1px solid #e8e8e8;
  border-radius: 5px;
  background: #fff;
  font-size: 12px;
  line-height: 1.4;
  color: #222;
}

.prop-input:focus {
  outline: none;
  border-color: #999;
}

.preview {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
}

.preview-body {
  flex: 1;
  width: 100%;
  margin: 0;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
  font-family: ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: 11px;
  line-height: 1.55;
  color: #333;
  resize: vertical;
  min-height: 120px;
  max-height: 220px;
  overflow-y: auto;
}

.preview-body:focus {
  outline: none;
  border-color: #999;
}

.footer {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 4px;
  border-top: 1px solid #f0f0f0;
}

.btn {
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
  transition: background 0.15s ease;
  line-height: 1;
}

.btn-icon {
  width: 14px;
  height: 14px;
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

.btn-save {
  width: 100%;
}

.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.ai-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 6px;
}

.btn-ai {
  padding: 8px 6px;
  font-size: 11px;
  font-weight: 500;
  background: #fafafa;
  border: 1px solid #e8e8e8;
  color: #444;
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
</style>