#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🚀 Preparing deployment to Vercel...\n');

// Check if vercel.json exists
const vercelConfig = join(projectRoot, 'vercel.json');
if (existsSync(vercelConfig)) {
  console.log('✅ vercel.json configuration found');
} else {
  console.log('❌ vercel.json not found. This is required for Vercel deployment.');
  process.exit(1);
}

// Check if build works
console.log('🔨 Testing build process...');
try {
  execSync('npm run build', { cwd: projectRoot, stdio: 'inherit' });
  console.log('✅ Build successful\n');
} catch (error) {
  console.log('❌ Build failed. Please fix build errors before deploying.\n');
  process.exit(1);
}

// Check environment variables
console.log('🔍 Checking required environment variables...');
const requiredEnvVars = [
  'DATABASE_URL',
  'OPENAI_API_KEY',
  'SESSION_SECRET'
];

const envFile = join(projectRoot, '.env');
if (existsSync(envFile)) {
  const envContent = readFileSync(envFile, 'utf8');
  const missingVars = requiredEnvVars.filter(varName => 
    !envContent.includes(`${varName}=`) || 
    envContent.includes(`${varName}=your_`) || 
    envContent.includes(`${varName}=`)
  );
  
  if (missingVars.length > 0) {
    console.log('⚠️  Missing or incomplete environment variables:');
    missingVars.forEach(varName => console.log(`   - ${varName}`));
    console.log('\n📝 Please set these in your Vercel dashboard:\n');
    console.log('   1. Go to your Vercel project settings');
    console.log('   2. Navigate to Environment Variables');
    console.log('   3. Add the required variables\n');
  } else {
    console.log('✅ All required environment variables found in .env');
    console.log('📝 Make sure to set these in your Vercel dashboard\n');
  }
}

// Check if Vercel CLI is installed
try {
  execSync('vercel --version', { stdio: 'pipe' });
  console.log('✅ Vercel CLI is installed');
  
  console.log('\n🚀 Ready to deploy! Choose your deployment method:');
  console.log('\n📦 Method 1: GitHub Integration (Recommended)');
  console.log('1. Push your code to GitHub');
  console.log('2. Connect your repository to Vercel');
  console.log('3. Vercel will automatically deploy on commits');
  
  console.log('\n⚡ Method 2: Direct CLI Deployment');
  console.log('1. Run: vercel --prod');
  console.log('2. Follow the prompts');
  
  console.log('\n📋 Post-deployment checklist:');
  console.log('1. Set environment variables in Vercel dashboard');
  console.log('2. Run database migrations: npm run db:push');
  console.log('3. Test your deployed application');
  console.log('4. Monitor logs for any issues');
  
} catch (error) {
  console.log('📦 Vercel CLI not found. Installing...');
  try {
    execSync('npm install -g vercel', { stdio: 'inherit' });
    console.log('✅ Vercel CLI installed successfully');
    console.log('🔐 Run: vercel login');
    console.log('🚀 Then run: vercel --prod');
  } catch (installError) {
    console.log('❌ Failed to install Vercel CLI');
    console.log('💡 Please install manually: npm install -g vercel');
  }
}

console.log('\n📚 For detailed deployment instructions, see DEPLOYMENT.md');