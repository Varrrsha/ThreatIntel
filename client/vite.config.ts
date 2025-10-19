import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // keep this if you’re using JSX

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',   // Output folder for Vercel
    emptyOutDir: true
  }
});
