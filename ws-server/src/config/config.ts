import dotenv from "dotenv";

dotenv.config();

function getEnv(key: string, required = true): string {
  const value = process.env[key];

  if (!value && required) {
    throw new Error(`❌ Missing environment variable: ${key}`);
  }

  return value as string;
}

export const config = {

  PORT: Number(getEnv("PORT", false)) || 3000,

  INTERNAL_SECRET: getEnv("INTERNAL_SECRET"),

  BASE_API_URL: getEnv("BASE_API_URL"),
};