import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import webExtension from 'vite-plugin-web-extension';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    react(),
    webExtension({
      manifest: 'src/manifest.json',
      additionalInputs: ['src/content/index.ts', 'src/offscreen/offscreen.html'],
    }),
    viteStaticCopy({
      targets: [{ src: 'icons', dest: '.' }],
    }),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2022',
    rollupOptions: {
      output: {
        // Chrome extensions cannot load files whose names start with "_".
        // Rollup's CommonJS interop virtual modules are prefixed with a null
        // byte (\x00), which Rollup's default sanitizer converts to "_",
        // producing "_commonjsHelpers.js".  We strip the null bytes first,
        // then remove any remaining leading underscores, and finally apply
        // the standard file-system sanitization for other invalid characters.
        sanitizeFileName: (name) =>
          name
            .replace(/\x00/g, '')            // remove Rollup internal null-byte prefix
            .replace(/[\\/:*?"<>|]/g, '_')   // replace OS-invalid chars
            .replace(/^_+/, ''),             // remove leading underscores (Chrome restriction)
      },
    },
  },
  esbuild: {
    keepNames: true,
  },
});
