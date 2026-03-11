import "dotenv/config";

function env(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

export const config = {
  port: parseInt(env("PORT", "4000"), 10),
  nodeEnv: env("NODE_ENV", "development"),
  databaseUrl: env("DATABASE_URL"),
  jwt: {
    secret: env("JWT_SECRET", "dev-secret-change-in-production"),
    expiresIn: env("JWT_EXPIRES_IN", "7d"),
    refreshExpiresIn: env("JWT_REFRESH_EXPIRES_IN", "30d"),
  },
  frontendUrl: env("FRONTEND_URL", "http://localhost:3000"),
  uploadDir: env("UPLOAD_DIR", "uploads"),
  apiBaseUrl: env("API_BASE_URL", "http://localhost:4000"),
} as const;
