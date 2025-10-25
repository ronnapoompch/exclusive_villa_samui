#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration
const PROJECT_ROOT = path.join(__dirname, '..');
const ENV_FILE = path.join(PROJECT_ROOT, '.env');
const ENV_EXAMPLE_FILE = path.join(PROJECT_ROOT, '.env.example');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bright: '\x1b[1m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function printHeader(title) {
  const border = '='.repeat(60);
  console.log(colorize(border, 'cyan'));
  console.log(colorize(title.toUpperCase(), 'bright'));
  console.log(colorize(border, 'cyan'));
}

// Check if .env exists
function checkEnvFile() {
  return fs.existsSync(ENV_FILE);
}

// Read current .env if exists
function readCurrentEnv() {
  if (!fs.existsSync(ENV_FILE)) {
    return {};
  }
  
  const content = fs.readFileSync(ENV_FILE, 'utf8');
  const env = {};
  
  content.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        env[key] = valueParts.join('=');
      }
    }
  });
  
  return env;
}

// Create or update .env file
function writeEnvFile(envData) {
  let content = '';
  
  // Add header
  content += '# Environment Configuration for Exclusive Villa Samui\n';
  content += `# Generated on ${new Date().toISOString()}\n\n`;
  
  // Add existing variables first (if any)
  const existingEnv = readCurrentEnv();
  
  // Important variables first
  const supabaseVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  content += '# Supabase Configuration\n';
  for (const key of supabaseVars) {
    const value = envData[key] || existingEnv[key] || '';
    content += `${key}=${value}\n`;
  }
  content += '\n';
  
  // Migration settings
  content += '# Migration Settings\n';
  content += `MIGRATION_BATCH_SIZE=${envData.MIGRATION_BATCH_SIZE || '10'}\n`;
  content += `MIGRATION_DRY_RUN=${envData.MIGRATION_DRY_RUN || 'false'}\n\n`;
  
  // Add other existing variables
  const processedKeys = [...supabaseVars, 'MIGRATION_BATCH_SIZE', 'MIGRATION_DRY_RUN'];
  
  for (const [key, value] of Object.entries(existingEnv)) {
    if (!processedKeys.includes(key)) {
      content += `${key}=${value}\n`;
    }
  }
  
  fs.writeFileSync(ENV_FILE, content);
}

// Validate Supabase URL format
function validateSupabaseUrl(url) {
  if (!url) return false;
  return url.includes('supabase.co') || url.includes('localhost') || url.includes('127.0.0.1');
}

// Validate key format
function validateKey(key, type) {
  if (!key) return false;
  
  if (type === 'anon') {
    return key.length > 100 && key.startsWith('eyJ');
  } else if (type === 'service') {
    return key.length > 100 && key.startsWith('eyJ');
  }
  
  return key.length > 20;
}

// Main setup function
async function setupEnvironment() {
  printHeader('🔧 Supabase Environment Setup for Migration');
  
  console.log('\nThis wizard will help you configure Supabase for villa images migration.');
  console.log('You need to get these values from your Supabase dashboard:\n');
  console.log('🌐 Project URL: https://supabase.com/dashboard/project/[project-id]');
  console.log('🔑 API Keys: Settings → API → Project API keys');
  console.log('');
  
  try {
    // Check existing .env
    const hasEnv = checkEnvFile();
    const currentEnv = readCurrentEnv();
    
    if (hasEnv && Object.keys(currentEnv).length > 0) {
      console.log(colorize('📁 Found existing .env file with configuration', 'yellow'));
      
      const overwrite = await question('Do you want to update Supabase configuration? (y/N): ');
      if (!overwrite.toLowerCase().startsWith('y')) {
        console.log(colorize('✅ Keeping existing configuration', 'green'));
        rl.close();
        return;
      }
    }
    
    const envData = { ...currentEnv };
    
    // Get Supabase URL
    console.log(colorize('\n🌐 SUPABASE PROJECT URL', 'cyan'));
    console.log('This looks like: https://[project-id].supabase.co');
    
    let supabaseUrl = '';
    while (!validateSupabaseUrl(supabaseUrl)) {
      supabaseUrl = await question('Enter Supabase URL: ');
      if (!validateSupabaseUrl(supabaseUrl)) {
        console.log(colorize('❌ Invalid URL format. Should contain "supabase.co"', 'red'));
      }
    }
    envData.NEXT_PUBLIC_SUPABASE_URL = supabaseUrl;
    
    // Get Anon Key
    console.log(colorize('\n🔑 SUPABASE ANON KEY', 'cyan'));
    console.log('This is the "anon" key from your API settings (public key)');
    
    let anonKey = '';
    while (!validateKey(anonKey, 'anon')) {
      anonKey = await question('Enter Anon Key: ');
      if (!validateKey(anonKey, 'anon')) {
        console.log(colorize('❌ Invalid key format. Should be a long JWT token starting with "eyJ"', 'red'));
      }
    }
    envData.NEXT_PUBLIC_SUPABASE_ANON_KEY = anonKey;
    
    // Get Service Role Key
    console.log(colorize('\n🔐 SUPABASE SERVICE ROLE KEY', 'cyan'));
    console.log(colorize('⚠️  IMPORTANT: This is the "service_role" key (SECRET - admin access)', 'yellow'));
    console.log('This key has full database access - keep it secure!');
    
    let serviceKey = '';
    while (!validateKey(serviceKey, 'service')) {
      serviceKey = await question('Enter Service Role Key: ');
      if (!validateKey(serviceKey, 'service')) {
        console.log(colorize('❌ Invalid key format. Should be a long JWT token starting with "eyJ"', 'red'));
      }
    }
    envData.SUPABASE_SERVICE_ROLE_KEY = serviceKey;
    
    // Migration settings
    console.log(colorize('\n⚙️  MIGRATION SETTINGS', 'cyan'));
    
    const batchSize = await question('Batch size for uploads (default: 10): ') || '10';
    envData.MIGRATION_BATCH_SIZE = batchSize;
    
    // Write .env file
    writeEnvFile(envData);
    
    console.log(colorize('\n✅ Environment configuration saved successfully!', 'green'));
    console.log(`📁 File: ${ENV_FILE}`);
    
    // Test connection
    console.log(colorize('\n🧪 Testing Supabase connection...', 'yellow'));
    
    try {
      // Set environment variables for testing
      process.env.NEXT_PUBLIC_SUPABASE_URL = envData.NEXT_PUBLIC_SUPABASE_URL;
      process.env.SUPABASE_SERVICE_ROLE_KEY = envData.SUPABASE_SERVICE_ROLE_KEY;
      
      // Try to import and test
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(
        envData.NEXT_PUBLIC_SUPABASE_URL,
        envData.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );
      
      // Simple connection test
      const { error } = await supabase.from('_dummy_').select('*').limit(1);
      
      // Error is expected for non-existent table, but connection should work
      if (!error || error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('table')) {
        console.log(colorize('✅ Supabase connection successful!', 'green'));
      } else {
        console.log(colorize(`⚠️  Connection test warning: ${error.message}`, 'yellow'));
        console.log(colorize('This might be normal if your database is empty', 'yellow'));
      }
      
    } catch (testError) {
      console.log(colorize(`❌ Connection test failed: ${testError.message}`, 'red'));
      console.log(colorize('Please verify your keys are correct', 'yellow'));
    }
    
    // Next steps
    console.log(colorize('\n🎯 NEXT STEPS:', 'cyan'));
    console.log('1. Run migration status: npm run migration-status');
    console.log('2. Create backup: npm run backup');
    console.log('3. Setup Supabase storage: npm run setup-supabase');
    console.log('4. Test migration: npm run migrate-images:dry-run');
    console.log('5. Run migration: npm run migrate-images');
    
  } catch (error) {
    console.error(colorize('\n💥 Setup failed:', 'red'), error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Export for use in other scripts
module.exports = {
  setupEnvironment,
  checkEnvFile,
  readCurrentEnv,
  writeEnvFile
};

// Run if called directly
if (require.main === module) {
  setupEnvironment()
    .then(() => {
      console.log(colorize('\n🎉 Environment setup completed!', 'green'));
      process.exit(0);
    })
    .catch((error) => {
      console.error(colorize('💥 Setup error:', 'red'), error.message);
      process.exit(1);
    });
}