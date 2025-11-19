// Test script za provjeru database konekcije
const fs = require('fs');
const path = require('path');

// Učitaj .env fajl ručno
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      // Ukloni navodnike ako postoje
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  });
}

const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log('🔍 Provjeravam database konekciju...\n');
  
  // Provjeri environment varijable
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL nije postavljen u .env fajlu!');
    process.exit(1);
  }
  
  if (!process.env.DIRECT_URL) {
    console.error('❌ DIRECT_URL nije postavljen u .env fajlu!');
    process.exit(1);
  }
  
  // Provjeri format
  console.log('📋 Provjera formata:');
  if (process.env.DATABASE_URL.includes('pgbouncer=true')) {
    console.log('✅ DATABASE_URL ima pgbouncer=true');
  } else {
    console.log('❌ DATABASE_URL NEMA pgbouncer=true');
  }
  
  if (process.env.DATABASE_URL.includes(':6543')) {
    console.log('✅ DATABASE_URL koristi port 6543 (pooler)');
  } else {
    console.log('⚠️  DATABASE_URL ne koristi port 6543');
  }
  
  if (process.env.DIRECT_URL.includes(':5432')) {
    console.log('✅ DIRECT_URL koristi port 5432 (direct)');
  } else {
    console.log('⚠️  DIRECT_URL ne koristi port 5432');
  }
  
  // Maskiraj password u outputu
  const maskedUrl = process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@');
  console.log(`\n📝 DATABASE_URL: ${maskedUrl.substring(0, 80)}...`);
  
  // Testiraj konekciju
  console.log('\n🔌 Pokušavam spojiti se na bazu...');
  const prisma = new PrismaClient({
    log: ['error'],
  });
  
  try {
    await prisma.$connect();
    console.log('✅ Konekcija uspješna! Baza radi ispravno.\n');
    
    // Testiraj jednostavan upit
    const userCount = await prisma.user.count();
    console.log(`📊 Broj korisnika u bazi: ${userCount}`);
    
    await prisma.$disconnect();
    console.log('\n🎉 Sve radi ispravno!');
  } catch (error) {
    console.error('\n❌ Greška pri spajanju na bazu:');
    console.error(error.message);
    
    if (error.message.includes('P1001') || error.message.includes('Can\'t reach database server')) {
      console.error('\n💡 Mogući uzroci:');
      console.error('   - Pogrešan password u connection stringu');
      console.error('   - Pogrešan host ili port');
      console.error('   - Mreža blokira konekciju');
      console.error('\n💡 Rješenje:');
      console.error('   1. Idite na Vercel Dashboard → Settings → Environment Variables');
      console.error('   2. Kopirajte TOČNE vrijednosti DATABASE_URL i DIRECT_URL');
      console.error('   3. Zamijenite vrijednosti u lokalnom .env fajlu');
    } else if (error.message.includes('P1000') || error.message.includes('Authentication failed')) {
      console.error('\n💡 Problem: Autentifikacija neuspješna');
      console.error('   - Provjerite da je password u connection stringu točan');
      console.error('   - Password može sadržavati posebne znakove koji trebaju biti URL-encoded');
    }
    
    await prisma.$disconnect();
    process.exit(1);
  }
}

testConnection();

