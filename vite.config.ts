import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Laad variabelen uit de omgeving (Netlify Dashboard)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Dit zorgt dat jouw code toegang heeft tot de sleutel die je in Netlify hebt ingesteld
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});
