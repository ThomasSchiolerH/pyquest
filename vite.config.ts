import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
const repository = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'pyquest';
const base = process.env.VITE_BASE_PATH || (repository.endsWith('.github.io') ? '/' : `/${repository}/`);
export default defineConfig({
  base, plugins: [react(), tailwindcss(), VitePWA({
    registerType:'prompt', includeAssets:['icon.svg','icon-192.png','icon-512.png','apple-touch-icon.png','python-worker.js'],
    manifest:{name:'PyQuest — Python to possibility',short_name:'PyQuest',description:'Learn Python and AI, one small quest at a time.',theme_color:'#c8ee8f',background_color:'#f8f9f5',display:'standalone',start_url:base,scope:base,icons:[{src:'icon-192.png',sizes:'192x192',type:'image/png'},{src:'icon-512.png',sizes:'512x512',type:'image/png',purpose:'any'},{src:'icon-512.png',sizes:'512x512',type:'image/png',purpose:'maskable'}]},
    workbox:{globPatterns:['**/*.{js,css,html,svg,png,json,woff2}'],maximumFileSizeToCacheInBytes:6000000,navigateFallback:`${base}index.html`,cleanupOutdatedCaches:true},
    devOptions:{enabled:false}
  })],
  test:{environment:'node',include:['tests/**/*.test.ts']},
  build:{chunkSizeWarningLimit:1500,rollupOptions:{output:{manualChunks:{editor:['@uiw/react-codemirror','@codemirror/lang-python','@codemirror/theme-one-dark']}}}}
});
