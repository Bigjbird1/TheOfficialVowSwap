const requiredEnvVars = [
  // Database
  'DATABASE_URL',
  
  // Supabase
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  
  // Next Auth
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  
  // Stripe
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  
  // Email (Optional)
  // 'SMTP_HOST',
  // 'SMTP_PORT',
  // 'SMTP_USER',
  // 'SMTP_PASSWORD',
  // 'EMAIL_FROM',
  
  // Redis (Optional)
  // 'REDIS_URL',
  
  // Analytics (Optional)
  // 'NEXT_PUBLIC_ANALYTICS_ID',
  
  // PWA
  'NEXT_PUBLIC_SITE_URL'
];

function validateEnv() {
  const missingVars = [];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }
  
  if (missingVars.length > 0) {
    console.error('\x1b[31m%s\x1b[0m', 'Error: Missing required environment variables:');
    missingVars.forEach(variable => {
      console.error(`  - ${variable}`);
    });
    console.error('\nPlease add these variables to your .env file before deploying.');
    process.exit(1);
  }
  
  // Validate URL formats
  try {
    new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
    new URL(process.env.NEXTAUTH_URL);
    new URL(process.env.NEXT_PUBLIC_SITE_URL);
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', 'Error: Invalid URL format in environment variables');
    console.error(error.message);
    process.exit(1);
  }
  
  // Validate database URL format
  if (!process.env.DATABASE_URL.startsWith('postgresql://')) {
    console.error('\x1b[31m%s\x1b[0m', 'Error: DATABASE_URL must be a valid PostgreSQL connection string');
    process.exit(1);
  }
  
  console.log('\x1b[32m%s\x1b[0m', '✓ Environment variables validated successfully');
}

validateEnv();
