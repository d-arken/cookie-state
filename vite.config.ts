import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isLibBuild = mode === 'lib'
  
  if (isLibBuild) {
    // Library build configuration
    return {
      plugins: [
        react(),
        dts({
          include: ['src/**/*'],
          exclude: ['src/**/*.test.*', 'src/**/*.spec.*']
        })
      ],
      build: {
        lib: {
          entry: resolve(__dirname, 'src/index.ts'),
          name: 'CookieState',
          formats: ['es', 'cjs'],
          fileName: (format) => `index.${format === 'es' ? 'es.js' : 'js'}`
        },
        rollupOptions: {
          external: ['react', 'react-dom'],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM'
            }
          }
        }
      }
    }
  } else {
    // Demo app build configuration
    return {
      plugins: [react()],
      base: './', // For GitHub Pages compatibility
      build: {
        outDir: 'dist'
      }
    }
  }
})

