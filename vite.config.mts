import { defineConfig } from 'vite'
import RubyPlugin from 'vite-plugin-ruby'
import react from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

export default defineConfig({
  plugins: [
    RubyPlugin(),
    react(),
    babel({
      include: /\.jsx(?:$|\?)/,
      plugins: ['styled-jsx/babel'],
    }),
  ],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  build: {
    sourcemap: true,
  },
})
