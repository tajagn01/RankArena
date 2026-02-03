// Run this script to generate a secure JWT secret
// Usage: node generate-jwt-secret.js

const crypto = require('crypto');

const secret = crypto.randomBytes(32).toString('hex');

console.log('\n==============================================');
console.log('🔐 Generated JWT Secret:');
console.log('==============================================\n');
console.log(secret);
console.log('\n==============================================');
console.log('📝 Add this to your backend/.env file:');
console.log('==============================================\n');
console.log(`JWT_SECRET=${secret}`);
console.log('\n==============================================\n');
