import { z } from 'zod';

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url().default('http://localhost:3000/api/v1'),
  VITE_APP_NAME: z.string().default('Trash Here Enterprise'),
  VITE_ENVIRONMENT: z.enum(['development', 'staging', 'production']).default('development'),
});

const _env = envSchema.safeParse(import.meta.env);

if (!_env.success) {
  console.error('❌ Invalid frontend environment variables:', _env.error.format());
  throw new Error('Invalid environment variables. Check .env configuration.');
}

export const envConfig = {
  apiBaseUrl: _env.data.VITE_API_BASE_URL,
  appName: _env.data.VITE_APP_NAME,
  environment: _env.data.VITE_ENVIRONMENT,
  isDev: _env.data.VITE_ENVIRONMENT === 'development',
  isProd: _env.data.VITE_ENVIRONMENT === 'production',
};
