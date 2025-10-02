import {resolve} from 'node:path';
import {defineConfig} from 'vite';
import {viteStaticCopy} from 'vite-plugin-static-copy';
import react from '@vitejs/plugin-react';


export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: '../manifest.json',
          dest: '.'
        },
        { 
          src: '../entity-extensions.json', 
          dest: '.' 
        },
        {
          src: '*.*',
          dest: '.'
        },
        {
          src: '../public/*.*',
          dest: '.'
        }
      ]
    }),
  ],
  root: './src',
  base: '',
  publicDir: 'public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    copyPublicDir: false,
    target: ['es2022'],
    assetsDir: 'widgets/assets',
    rollupOptions: {
      input: {
        mainMenuItem: resolve('src/widgets/main_menu_item/index.html')
      }
    }
  }
});
