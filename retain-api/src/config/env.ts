// a missing required setting stops the server at startup, instead of failing later on the first request
export function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable ${name} (set it in .env locally, or in Render's Environment settings)`);
  }
  return value;
}

// secrets are required to be long enough to be not obvious. the server doesn't start if they are too short
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
  // the client URLs are used in CORS to allow only those websites to call the API
  clientUrls: (process.env.CLIENT_URL ?? 'http://localhost:5173').split(',').map((url) => url.trim()),
};
