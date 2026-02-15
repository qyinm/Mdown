import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  manifest: {
    name: 'Mdown',
    description: 'Save web pages as clean Markdown files',
    action: {
      default_title: 'Mdown',
    },
    permissions: ['activeTab', 'scripting', 'downloads', 'contextMenus'],
    host_permissions: [
      'https://chatgpt.com/*',
      'https://claude.ai/*',
      'https://gemini.google.com/*',
    ],
  },
});
