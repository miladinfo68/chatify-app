import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.join(__dirname, 'frontend', 'dist');
const targetDir = path.join(__dirname, 'backend', 'dist', 'frontApp');

console.log('📁 Starting frontend copy process...');
console.log(`🔍 Source: ${sourceDir}`);
console.log(`🎯 Target: ${targetDir}`);

// Check if source exists
if (!fs.existsSync(sourceDir)) {
  console.error('❌ Frontend dist directory not found!');
  console.log('💡 Make sure to run: cd frontend && npm run build first');
  process.exit(1);
}

// Ensure backend dist directory exists
if (!fs.existsSync(path.join(__dirname, 'backend', 'dist'))) {
  console.error('❌ Backend dist directory not found!');
  console.log('💡 Make sure to run: cd backend && npm run build first');
  process.exit(1);
}

// Remove existing frontApp directory if it exists
if (fs.existsSync(targetDir)) {
  console.log('🗑️ Removing existing frontApp directory...');
  fs.rmSync(targetDir, { recursive: true, force: true });
}

// Copy frontend files
try {
  console.log('📤 Copying frontend files...');
  
  // Create target directory
  fs.mkdirSync(targetDir, { recursive: true });
  
  // Copy all files recursively
  const copyRecursive = (src, dest) => {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true });
        copyRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  };
  
  copyRecursive(sourceDir, targetDir);
  
  console.log('✅ Frontend files copied successfully!');
  console.log(`📊 Files copied to: ${targetDir}`);
  
  // List copied files for verification
  const listFiles = (dir, prefix = '') => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    entries.forEach(entry => {
      if (entry.isDirectory()) {
        console.log(`${prefix}📁 ${entry.name}/`);
        listFiles(path.join(dir, entry.name), prefix + '  ');
      } else {
        console.log(`${prefix}📄 ${entry.name}`);
      }
    });
  };
  
  console.log('\n📋 Copied file structure:');
  listFiles(targetDir);
  
} catch (error) {
  console.error('❌ Error copying frontend files:', error);
  process.exit(1);
}