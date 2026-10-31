import {defineConfig} from 'vite';
export default defineConfig({build:{rollupOptions:{input:['index.html','tools/blank-line-remover.html','tools/email-template-builder.html','tools/prompt-manager.html']}}});
