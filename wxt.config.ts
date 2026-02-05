import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  manifest: {
    name: 'Mdown',
    description: 'Save web pages as clean Markdown files',
    permissions: ['activeTab', 'scripting', 'downloads', 'contextMenus'],
  },
});
