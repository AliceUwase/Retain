export const env = {
  port: Number(process.env.PORT ?? 4000), // Render sets PORT for us
  nodeEnv: process.env.NODE_ENV ?? 'development',
};
