#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🚀 Setting up Legal Compliance Platform for local development...\n');

// Check if .env file exists
const envFile = join(projectRoot, '.env');
if (!existsSync(envFile)) {
  console.log('📝 Creating .env file...');
  execSync('cp .env.example .env', { cwd: projectRoot });
  console.log('✅ Created .env file from .env.example');
  console.log('⚠️  Please edit .env with your database credentials and OpenAI API key\n');
} else {
  console.log('✅ .env file already exists\n');
}

// Check if node_modules exists
const nodeModules = join(projectRoot, 'node_modules');
if (!existsSync(nodeModules)) {
  console.log('📦 Installing dependencies...');
  execSync('npm install', { cwd: projectRoot, stdio: 'inherit' });
  console.log('✅ Dependencies installed\n');
} else {
  console.log('✅ Dependencies already installed\n');
}

// Check if Docker is available
try {
  execSync('docker --version', { stdio: 'pipe' });
  console.log('🐳 Docker is available');
  
  // Check if docker-compose is available
  try {
    execSync('docker-compose --version', { stdio: 'pipe' });
    console.log('🐳 Docker Compose is available');
    console.log('💡 You can start PostgreSQL with: docker-compose up -d postgres\n');
  } catch (error) {
    console.log('⚠️  Docker Compose not found. Please install it or use local PostgreSQL\n');
  }
} catch (error) {
  console.log('⚠️  Docker not found. Please install Docker or use local PostgreSQL\n');
}

// Instructions
console.log('📋 Next steps:');
console.log('1. Edit .env file with your configuration');
console.log('2. Start PostgreSQL:');
console.log('   - With Docker: docker-compose up -d postgres');
console.log('   - Or use your local PostgreSQL installation');
console.log('3. Set up database schema: npm run db:push');
console.log('4. Start development server: npm run dev');
console.log('5. Open http://localhost:5000 in your browser\n');

console.log('🎯 For deployment to Vercel, see DEPLOYMENT.md');
console.log('📚 For detailed setup instructions, see LOCAL_SETUP.md');