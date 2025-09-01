// vite.config.ts

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'safari-pinned-tab.svg'],
        manifest: {
          name: 'TSVerseHub - TypeScript Learning Platform',
          short_name: 'TSVerseHub',
          description: 'Master TypeScript from basics to advanced concepts',
          theme_color: '#2563eb',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: 'images/icons/typescript.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'images/icons/typescript.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
                },
                cacheKeyWillBeUsed: async ({ request }) => {
                  return `${request.url}?${Date.now()}`;
                }
              }
            },
            {
              urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'jsdelivr-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                }
              }
            }
          ]
        }
      })
    ],
    
    // Path resolution
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@/components': resolve(__dirname, './src/components'),
        '@/concepts': resolve(__dirname, './src/concepts'),
        '@/mini-projects': resolve(__dirname, './src/mini-projects'),
        '@/hooks': resolve(__dirname, './src/hooks'),
        '@/utils': resolve(__dirname, './src/utils'),
        '@/pages': resolve(__dirname, './src/pages'),
        '@/styles': resolve(__dirname, './src/styles'),
        '@/assets': resolve(__dirname, './src/assets'),
        '@/types': resolve(__dirname, './src/types')
      }
    },
    
    // Development server configuration
    server: {
      port: 5173,
      host: true,
      open: true,
      cors: true,
      hmr: {
        overlay: true
      }
    },
    
    // Preview server configuration
    preview: {
      port: 4173,
      host: true,
      cors: true
    },
    
    // Build configuration
    build: {
      outDir: 'dist',
      sourcemap: command === 'build' && mode === 'development',
      minify: 'esbuild',
      target: 'es2020',
      cssTarget: 'chrome80',
      
      // Rollup options
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html')
        },
        output: {
          manualChunks: {
            // Vendor chunks
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            ui: ['lucide-react', 'framer-motion'],
            editor: ['@monaco-editor/react', 'monaco-editor'],
            charts: ['recharts'],
            utils: ['clsx', 'tailwind-merge']
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name?.split('.') ?? [];
            const extType = info[info.length - 1];
            
            if (/\.(png|jpe?g|gif|svg|ico|webp)$/i.test(assetInfo.name ?? '')) {
              return 'assets/images/[name]-[hash].[ext]';
            }
            if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name ?? '')) {
              return 'assets/fonts/[name]-[hash].[ext]';
            }
            if (extType === 'css') {
              return 'assets/css/[name]-[hash].[ext]';
            }
            return 'assets/[name]-[hash].[ext]';
          }
        }
      },
      
      // Chunk size warnings
      chunkSizeWarningLimit: 1000,
      
      // Enable/disable CSS code splitting
      cssCodeSplit: true,
      
      // Asset handling
      assetsDir: 'assets',
      assetsInlineLimit: 4096,
      
      // Report compressed size
      reportCompressedSize: true,
      
      // Emit manifest for deployment tools
      manifest: true
    },
    
    // CSS configuration
    css: {
      modules: {
        localsConvention: 'camelCase'
      },
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables.scss";`
        }
      },
      devSourcemap: true
    },
    
    // Define global constants
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __DEV__: JSON.stringify(mode === 'development'),
      __PROD__: JSON.stringify(mode === 'production')
    },
    
    // Dependency optimization
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@monaco-editor/react',
        'monaco-editor',
        'lucide-react',
        'framer-motion',
        'recharts',
        'clsx',
        'tailwind-merge',
        'zustand',
        'react-hot-toast'
      ],
      exclude: ['@vite/client', '@vite/env']
    },
    
    // ESBuild configuration
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' },
      target: 'es2020',
      supported: {
        'top-level-await': true
      }
    },
    
    // Worker configuration
    worker: {
      format: 'es',
      plugins: [react()]
    },
    
    // Environment variables prefix
    envPrefix: 'VITE_',
    
    // Base public path
    base: env.VITE_BASE_URL || '/',
    
    // Public directory
    publicDir: 'public',
    
    // Cache directory
    cacheDir: 'node_modules/.vite',
    
    // Log level
    logLevel: 'info',
    
    // Clear screen
    clearScreen: true,
    
    // App type
    appType: 'spa'
  };
});