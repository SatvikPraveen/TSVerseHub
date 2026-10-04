// vite.config.ts

import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const fromRoot = (p: string): string => fileURLToPath(new URL(p, import.meta.url));

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
          // The compiler-kernel worker (TypeScript itself, ~3.6 MB) and the
          // lazily loaded lib.*.d.ts chunks are not precached: only the
          // playground needs them, and only the reachable libs are fetched.
          // They are cached on first use instead (see ADR 0008).
          globIgnores: ['**/assets/compiler.worker-*.js', '**/assets/lib.*.js'],
          runtimeCaching: [
            {
              urlPattern: /\/assets\/(compiler\.worker-|lib\.)[^/]*\.js$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'compiler-kernel-cache',
                expiration: {
                  maxEntries: 120,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                }
              }
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
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
        '@': fromRoot('./src')
      }
    },
    
    // Development server configuration
    server: {
      port: 5173,
      host: true,
      open: false,
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
      // Vite 8 minifies with Oxc by default; 'esbuild' would need esbuild as
      // an extra install and is only kept by Vite for compatibility.
      minify: 'oxc',
      target: 'es2020',
      cssTarget: 'chrome80',

      // Rolldown options (Vite 8 bundles with Rolldown; `rollupOptions` is a
      // deprecated alias)
      rolldownOptions: {
        input: {
          main: fromRoot('./index.html')
        },
        output: {
          // Rolldown does not support Rollup's object form of `manualChunks`;
          // `codeSplitting.groups` is its replacement. Groups capture their
          // dependencies recursively, so `vendor` has the highest priority to
          // keep React in its own chunk instead of being pulled into the
          // first library chunk that imports it.
          codeSplitting: {
            groups: [
              { name: 'vendor', test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/, priority: 20 },
              { name: 'router', test: /[\\/]node_modules[\\/](react-router|react-router-dom|@remix-run[\\/]router)[\\/]/, priority: 10 },
              { name: 'ui', test: /[\\/]node_modules[\\/](lucide-react|framer-motion)[\\/]/, priority: 10 },
              { name: 'editor', test: /[\\/]node_modules[\\/](@monaco-editor[\\/](react|loader)|monaco-editor)[\\/]/, priority: 10 },
              { name: 'charts', test: /[\\/]node_modules[\\/]recharts[\\/]/, priority: 10 },
              { name: 'utils', test: /[\\/]node_modules[\\/](clsx|tailwind-merge)[\\/]/, priority: 10 }
            ]
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            // Rolldown deprecates `name` in favour of the `names` array.
            const name = assetInfo.names[0] ?? '';

            if (/\.(png|jpe?g|gif|svg|ico|webp)$/i.test(name)) {
              return 'assets/images/[name]-[hash].[ext]';
            }
            if (/\.(woff2?|eot|ttf|otf)$/i.test(name)) {
              return 'assets/fonts/[name]-[hash].[ext]';
            }
            if (/\.css$/i.test(name)) {
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
        'tailwind-merge'
      ],
      exclude: ['@vite/client', '@vite/env']
    },
    
    // Worker configuration
    worker: {
      format: 'es',
      plugins: () => [react()]
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