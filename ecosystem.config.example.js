module.exports = {
  apps: [{
    name: 'verstack-api',
    script: 'dist/main.js',
    instances: 1,
    exec_mode: 'fork',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,

      // Database
      MONGODB_URI: 'mongodb://localhost:27017/verstack',
      REDIS_HOST: 'localhost',
      REDIS_PORT: 6379,

      // JWT
      JWT_SECRET: 'your-jwt-secret-here',
      JWT_EXPIRES_IN: '7d',

      // Stripe (LIVE keys for production)
      STRIPE_SECRET_KEY: 'sk_live_your_stripe_secret_key',
      STRIPE_WEBHOOK_SECRET: 'whsec_your_webhook_secret',
      STRIPE_PRICE_ID: 'price_your_product_price_id',

      // Frontend URL
      FRONTEND_URL: 'https://your-domain.com',

      // Email (optional)
      SMTP_HOST: 'smtp.example.com',
      SMTP_PORT: 587,
      SMTP_USER: 'your-email@example.com',
      SMTP_PASS: 'your-email-password',
      SMTP_FROM: 'noreply@your-domain.com',
    }
  }]
};
