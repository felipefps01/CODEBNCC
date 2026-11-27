import fs from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function readPort() {
  try {
    const match = fs.readFileSync('.env', 'utf8').match(/^PORT=(\d+)\s*$/m);
    if (match) return Number(match[1]);
  } catch {
    // .env ausente: usa o valor do ambiente ou o padrão
  }
  return Number(process.env.PORT) || 3001;
}

const serverPort = readPort();

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: `http://localhost:${serverPort}`,
        changeOrigin: true
      }
    }
  }
});
