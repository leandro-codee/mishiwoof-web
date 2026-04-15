import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

function apiOriginFromEnv(env: Record<string, string>): string {
  const raw =
    env.VITE_PUBLIC_API_URL ||
    env.VITE_API_BASE_URL ||
    'http://localhost:4800/api/v1';
  const withProtocol = raw.startsWith('http://') || raw.startsWith('https://') ? raw : `http://${raw}`;
  try {
    return new URL(withProtocol).origin;
  } catch {
    return 'http://localhost:4800';
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = apiOriginFromEnv(env);

  return {
  // HTTPS local: requerido por MP Bricks / PCI (tokenización de tarjeta en el browser)
  plugins: [react(), tailwindcss(), basicSsl()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@app': path.resolve(__dirname, './src/app'),
      '@modules': path.resolve(__dirname, './src/modules'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@components': path.resolve(__dirname, './src/components'),
      '@providers': path.resolve(__dirname, './src/providers'),
      '@types': path.resolve(__dirname, './src/types'),
      '@styles': path.resolve(__dirname, './src/styles'),
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      // En dev: /api/* → mismo host que VITE_API_BASE_URL (por defecto :4800)
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
          ],
        },
      },
    },
  },
  };
});
