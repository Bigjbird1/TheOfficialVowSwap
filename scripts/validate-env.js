const requiredEnvVars = {
  base: [
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
    
    // PWA
    'NEXT_PUBLIC_SITE_URL'
  ],
  production: [
    // Error Tracking
    'SENTRY_DSN',
    'NEXT_PUBLIC_ANALYTICS_ID',
    
    // Performance
    'NEXT_PUBLIC_IMAGE_OPTIMIZATION_LEVEL',
    'NEXT_PUBLIC_CACHE_MAX_AGE'
  ],
  staging: [
    // Error Tracking
    'SENTRY_DSN',
    'NEXT_PUBLIC_ANALYTICS_ID'
  ]
};

const optionalEnvVars = [
  // Email
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASSWORD',
  'EMAIL_FROM',
  
  // Redis
  'REDIS_URL',
  
  // Feature Flags
  'NEXT_PUBLIC_ENABLE_REALTIME_UPDATES',
  'NEXT_PUBLIC_ENABLE_PUSH_NOTIFICATIONS',
  'NEXT_PUBLIC_ENABLE_OFFLINE_MODE'
];

function validateEnvValue(name, value) {
  // URL format validation
  if (name.includes('URL')) {
    try {
      new URL(value);
    } catch (error) {
      throw new Error(`Invalid URL format for ${name}: ${error.message}`);
    }
  }

  // Database URL format
  if (name === 'DATABASE_URL' && !value.startsWith('postgresql://')) {
    throw new Error('DATABASE_URL must be a valid PostgreSQL connection string');
  }

  // Numeric validations
  if (name === 'NEXT_PUBLIC_CACHE_MAX_AGE') {
    const num = parseInt(value);
    if (isNaN(num) || num < 0) {
      throw new Error('NEXT_PUBLIC_CACHE_MAX_AGE must be a positive number');
    }
  }

  if (name === 'SENTRY_TRACES_SAMPLE_RATE') {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0 || num > 1) {
      throw new Error('SENTRY_TRACES_SAMPLE_RATE must be between 0 and 1');
    }
  }

  // Environment-specific validations
  if (name === 'SENTRY_ENVIRONMENT') {
    if (!['production', 'staging', 'development'].includes(value)) {
      throw new Error('SENTRY_ENVIRONMENT must be production, staging, or development');
    }
  }

  if (name === 'NEXT_PUBLIC_IMAGE_OPTIMIZATION_LEVEL') {
    if (!['aggressive', 'balanced', 'minimal'].includes(value)) {
      throw new Error('NEXT_PUBLIC_IMAGE_OPTIMIZATION_LEVEL must be aggressive, balanced, or minimal');
    }
  }
}

function validateEnv() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const missingVars = [];
  const invalidVars = [];
  
  // Validate base variables
  for (const envVar of requiredEnvVars.base) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    } else {
      try {
        validateEnvValue(envVar, process.env[envVar]);
      } catch (error) {
        invalidVars.push(`${envVar}: ${error.message}`);
      }
    }
  }

  // Validate environment-specific variables
  if (nodeEnv === 'production' || nodeEnv === 'staging') {
    const envSpecificVars = requiredEnvVars[nodeEnv];
    for (const envVar of envSpecificVars) {
      if (!process.env[envVar]) {
        missingVars.push(envVar);
      } else {
        try {
          validateEnvValue(envVar, process.env[envVar]);
        } catch (error) {
          invalidVars.push(`${envVar}: ${error.message}`);
        }
      }
    }
  }

  // Validate optional variables if they are present
  for (const envVar of optionalEnvVars) {
    if (process.env[envVar]) {
      try {
        validateEnvValue(envVar, process.env[envVar]);
      } catch (error) {
        invalidVars.push(`${envVar}: ${error.message}`);
      }
    }
  }
  
  if (missingVars.length > 0 || invalidVars.length > 0) {
    if (missingVars.length > 0) {
      console.error('\x1b[31m%s\x1b[0m', 'Error: Missing required environment variables:');
      missingVars.forEach(variable => {
        console.error(`  - ${variable}`);
      });
    }
    
    if (invalidVars.length > 0) {
      console.error('\x1b[31m%s\x1b[0m', 'Error: Invalid environment variables:');
      invalidVars.forEach(error => {
        console.error(`  - ${error}`);
      });
    }
    
    console.error(`\nPlease check your .env.${nodeEnv} file and ensure all variables are properly set.`);
    process.exit(1);
  }
  
  console.log('\x1b[32m%s\x1b[0m', `✓ Environment variables for ${nodeEnv} validated successfully`);
}

validateEnv();
