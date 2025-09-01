// postcss.config.js

const path = require('path');

module.exports = {
  plugins: {
    // Import resolver for CSS imports
    'postcss-import': {
      resolve: (id, basedir) => {
        // Handle Tailwind imports
        if (id.startsWith('tailwindcss/')) {
          return path.resolve(require.resolve('tailwindcss'), '..', id.replace('tailwindcss/', ''));
        }
        return id;
      },
    },
    
    // Tailwind CSS processing
    tailwindcss: {},
    
    // PostCSS Preset Env for modern CSS features
    'postcss-preset-env': {
      stage: 1,
      features: {
        'custom-properties': false, // Tailwind handles this
        'nesting-rules': true,
        'custom-media-queries': true,
        'media-query-ranges': true,
      },
      browsers: [
        '>= 0.5%',
        'last 2 major versions',
        'not dead',
        'Chrome >= 60',
        'Firefox >= 60',
        'Safari >= 12',
        'Edge >= 79'
      ]
    },
    
    // Autoprefixer for vendor prefixes
    autoprefixer: {
      flexbox: 'no-2009',
      grid: 'autoplace',
    },
    
    // Development-only plugins
    ...(process.env.NODE_ENV === 'development' ? {
      // Source map support for better debugging
      'postcss-reporter': {
        clearReportedMessages: true,
      },
    } : {}),
    
    // Production-only plugins
    ...(process.env.NODE_ENV === 'production' ? {
      // CSS optimization and minification
      cssnano: {
        preset: ['default', {
          // Preserve important comments
          discardComments: {
            removeAll: false,
          },
          // Merge longhand properties
          mergeRules: true,
          // Merge media queries
          mergeIdents: false,
          // Reduce transform functions
          reduceTransforms: true,
          // Normalize whitespace
          normalizeWhitespace: true,
          // Remove unused CSS (be careful with this)
          discardUnused: false,
          // Optimize font weights
          minifyFontValues: true,
          // Optimize gradients
          minifyGradients: true,
          // Convert colors to shorter formats
          colormin: true,
          // Remove duplicate rules
          discardDuplicates: true,
          // Merge adjacent rules
          mergeLonghand: true,
          // Optimize calc() expressions
          calc: {
            precision: 3,
          },
          // Convert px to shorter units where possible
          convertValues: {
            length: false, // Keep px for consistency
          },
        }],
      },
      
      // PurgeCSS for removing unused styles (optional - Tailwind handles this)
      '@fullhuman/postcss-purgecss': {
        content: [
          './index.html',
          './src/**/*.{js,ts,jsx,tsx,vue}',
          './public/**/*.html',
        ],
        defaultExtractor: content => {
          // Extract class names from content
          const broadMatches = content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [];
          const innerMatches = content.match(/[^<>"'`\s.()]*[^<>"'`\s.():]/g) || [];
          return broadMatches.concat(innerMatches);
        },
        safelist: [
          // Whitelist dynamic classes
          /^(bg-|text-|border-|hover:|focus:)/,
          // Monaco Editor classes
          /^monaco-/,
          /^vs-/,
          // Animation classes
          /^animate-/,
          // Custom component classes
          /^btn/,
          /^card/,
          /^badge/,
          // Dark mode classes
          /^dark:/,
        ],
        // Skip files that shouldn't be purged
        rejected: true,
        printRejected: process.env.DEBUG === 'true',
      },
    } : {}),
  },
  
  // Parser options
  parser: require('postcss-comment'),
  
  // Source map configuration
  map: process.env.NODE_ENV === 'development' ? {
    inline: false,
    annotation: true,
    sourcesContent: true,
  } : false,
};