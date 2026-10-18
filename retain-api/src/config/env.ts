export const env = {
  port: Number(process.env.PORT ?? 4000), // on Render, PORT comes from Render itself
  nodeEnv: process.env.NODE_ENV ?? 'development',
};
