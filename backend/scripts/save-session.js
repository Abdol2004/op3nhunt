const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const authPath = path.join(__dirname, '../data/auth.json');

console.log('\n🔐 X Session Setup\n');
console.log('Choose method:');
console.log('1. Automatic (browser opens)');
console.log('2. Manual (copy token)\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter choice (1 or 2): ', async (choice) => {
  rl.close();
  choice === '2' ? await manualAuth() : await automaticAuth();
});

async function automaticAuth() {
  let browser = null;
  
  try {
    console.log('\n🚀 Opening browser...\n');
    
    browser = await chromium.launch({
      headless: false,
      args: ['--disable-blink-features=AutomationControlled']
    });
    
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
    
    const page = await context.newPage();
    await page.goto('https://x.com/login', { waitUntil: 'domcontentloaded' });
    
    console.log('⏳ Waiting for you to log in...\n');
    await page.waitForURL('**/home', { timeout: 300000 });
    
    console.log('✓ Login detected! Saving...\n');
    
    const storageState = await context.storageState();
    
    const dataDir = path.dirname(authPath);
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    
    fs.writeFileSync(authPath, JSON.stringify(storageState, null, 2));
    
    console.log('✅ Session saved!');
    console.log(`   Location: ${authPath}\n`);
    
    await browser.close();
    process.exit(0);
    
  } catch (error) {
    if (browser) await browser.close();
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

async function manualAuth() {
  console.log('\n📝 Manual Method:\n');
  console.log('1. Open Chrome → x.com → Login');
  console.log('2. Press F12 → Application → Cookies');
  console.log('3. Find "auth_token" cookie');
  console.log('4. Copy its VALUE\n');
  
  const rl2 = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl2.question('Paste auth_token: ', async (authToken) => {
    rl2.close();
    
    if (!authToken || authToken.length < 20) {
      console.error('\n❌ Invalid token\n');
      process.exit(1);
    }
    
    const authData = {
      cookies: [{
        name: 'auth_token',
        value: authToken.trim(),
        domain: '.x.com',
        path: '/',
        expires: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60),
        httpOnly: true,
        secure: true,
        sameSite: 'None'
      }],
      origins: []
    };
    
    const dataDir = path.dirname(authPath);
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    
    fs.writeFileSync(authPath, JSON.stringify(authData, null, 2));
    
    console.log('\n✅ Session saved!');
    console.log(`   Location: ${authPath}\n`);
    process.exit(0);
  });
}
