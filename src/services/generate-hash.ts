import * as crypto from 'crypto';

// 生成密码的SHA256哈希值
const password = 'password123';
const hash = crypto.createHash('sha256').update(password).digest('hex');

console.log(`Password: ${password}`);
console.log(`SHA256 Hash: ${hash}`);
