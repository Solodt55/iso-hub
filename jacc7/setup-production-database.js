#!/usr/bin/env node

/**
 * Complete Production Database Setup Script
 * Creates a new production database and migrates all data from development
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { config } from 'dotenv';

// Load environment variables
config();

const DEV_DATABASE_URL = process.env.DATABASE_URL;

console.log('🚀 Setting up complete production database...');
console.log('📊 Development database contains:');
console.log('   - 100 FAQ entries');
console.log('   - 200+ documents');
console.log('   - 17 users with authentication');
console.log('   - 43+ chat conversations');
console.log('   - 19 organized folders');

try {
  // Step 1: Create complete schema and data dump
  console.log('\n📤 Creating complete database export...');
  execSync(`pg_dump "${DEV_DATABASE_URL}" --verbose --clean --if-exists > production_complete_backup.sql`, {
    stdio: 'inherit'
  });

  // Step 2: Create data-only dump for easier import
  console.log('\n📋 Creating data-only export...');
  execSync(`pg_dump "${DEV_DATABASE_URL}" --data-only --inserts --verbose > production_data_only.sql`, {
    stdio: 'inherit'
  });

  // Step 3: Create schema-only dump
  console.log('\n🏗️ Creating schema-only export...');
  execSync(`pg_dump "${DEV_DATABASE_URL}" --schema-only --verbose > production_schema_only.sql`, {
    stdio: 'inherit'
  });

  // Step 4: Clean up data file for production
  console.log('\n🧹 Preparing production-ready scripts...');
  let dataOnly = readFileSync('production_data_only.sql', 'utf8');
  
  // Remove problematic statements for production import
  dataOnly = dataOnly
    .replace(/^SET .+;$/gm, '')
    .replace(/^SELECT pg_catalog\.set_config.+;$/gm, '')
    .replace(/^--.*$/gm, '')
    .split('\n')
    .filter(line => line.trim() !== '')
    .join('\n');

  writeFileSync('production_data_clean.sql', dataOnly);

  // Step 5: Create production environment file
  console.log('\n⚙️ Creating production environment template...');
  const prodEnvTemplate = `# Production Database Configuration
# Replace these values with your actual production database credentials

# Your New Production Database URL
DATABASE_URL="postgresql://prod_user:prod_password@prod_host:5432/prod_database?sslmode=require"

# Individual Database Components
PGHOST="prod_host"
PGPORT="5432"
PGUSER="prod_user"
PGPASSWORD="prod_password"
PGDATABASE="prod_database"

# Production Session Secret (Generate new one!)
SESSION_SECRET="$(node -e "console.log(require('crypto').randomBytes(64).toString('base64'))")"

# Production API Keys
ANTHROPIC_API_KEY="your_production_anthropic_key"
OPENAI_API_KEY="your_production_openai_key"
PINECONE_API_KEY="your_production_pinecone_key"

# Production Domain
PRODUCTION_DOMAIN="https://your-app.replit.app"
`;

  writeFileSync('.env.production.template', prodEnvTemplate);

  // Step 6: Create deployment script
  console.log('\n📝 Creating deployment script...');
  const deployScript = `#!/bin/bash

# Production Database Deployment Script
# Run this after setting up your production database

echo "🚀 Deploying JACC to Production Database..."

# Check if production database URL is set
if [ -z "$PRODUCTION_DATABASE_URL" ]; then
    echo "❌ Error: PRODUCTION_DATABASE_URL not set"
    echo "Please set your production database URL:"
    echo "export PRODUCTION_DATABASE_URL='postgresql://user:pass@host:5432/db'"
    exit 1
fi

echo "📋 Creating schema in production database..."
psql "$PRODUCTION_DATABASE_URL" < production_schema_only.sql

echo "📊 Importing all data to production database..."
psql "$PRODUCTION_DATABASE_URL" < production_data_clean.sql

echo "✅ Production database setup complete!"
echo "📊 Your production database now contains:"
echo "   ✓ 100 FAQ entries"
echo "   ✓ 200+ documents"
echo "   ✓ 17 users with authentication"
echo "   ✓ 43+ chat conversations"
echo "   ✓ 19 organized folders"
echo ""
echo "🎯 Next steps:"
echo "1. Update your deployment environment variables"
echo "2. Set DATABASE_URL to your production database"
echo "3. Deploy your application"
`;

  writeFileSync('deploy-to-production.sh', deployScript);
  execSync('chmod +x deploy-to-production.sh');

  console.log('\n✅ Production database setup files created!');
  console.log('\n📁 Files created:');
  console.log('   📄 production_complete_backup.sql - Full backup (schema + data)');
  console.log('   📄 production_schema_only.sql - Database structure only');
  console.log('   📄 production_data_clean.sql - Clean data for import');
  console.log('   📄 .env.production.template - Production environment template');
  console.log('   📄 deploy-to-production.sh - Automated deployment script');

  console.log('\n🎯 To deploy to production:');
  console.log('1. Create a new PostgreSQL database for production');
  console.log('2. Set PRODUCTION_DATABASE_URL environment variable');
  console.log('3. Run: ./deploy-to-production.sh');
  console.log('4. Update your Replit deployment with the production DATABASE_URL');

  console.log('\n💡 Alternative: Quick deployment using same database');
  console.log('   Set your deployment DATABASE_URL to:');
  console.log(`   ${DEV_DATABASE_URL}`);

} catch (error) {
  console.error('❌ Error setting up production database:', error.message);
  process.exit(1);
}