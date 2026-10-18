// a missing required setting stops the server at startup, instead of failing later on the first request
export function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable ${name} (set it in .env locally, or in Render's Environment settings)`);
  }
  return value;
}

// a short secret can be guessed by trying many values, which would let anyone forge login tokens
function secret(name: string): string {
  const value = required(name);
  if (value.length < 32) throw new Error(`${name} must be at least 32 characters long`);
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000), // on Render, PORT comes from Render itself
  nodeEnv: process.env.NODE_ENV ?? 'development',
  mongodbUri: required('MONGODB_URI'),
  jwtSecret: secret('JWT_SECRET'),
};
