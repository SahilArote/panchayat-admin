import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.resolve(__dirname, '../dist');
const adminDir = path.resolve(distDir, 'admin');

if (!fs.existsSync(adminDir)) {
  fs.mkdirSync(adminDir, { recursive: true });
}

if (fs.existsSync(path.resolve(distDir, 'index.html'))) {
  fs.cpSync(path.resolve(distDir, 'index.html'), path.resolve(adminDir, 'index.html'));
}
if (fs.existsSync(path.resolve(distDir, 'vite.svg'))) {
  fs.cpSync(path.resolve(distDir, 'vite.svg'), path.resolve(adminDir, 'vite.svg'));
}
if (fs.existsSync(path.resolve(distDir, 'assets'))) {
  fs.cpSync(path.resolve(distDir, 'assets'), path.resolve(adminDir, 'assets'), { recursive: true });
}

console.log('Successfully mirrored dist/ into dist/admin/');
