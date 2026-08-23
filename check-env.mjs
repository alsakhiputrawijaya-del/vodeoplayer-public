import { readFileSync } from 'fs';

const text = readFileSync('.env', 'utf8');
const get = (key) => {
  const m = text.match(new RegExp(key + '=(.+)'));
  return m ? m[1].trim() : null;
};

const anon = get('NEXT_PUBLIC_SUPABASE_ANON_KEY');
if (!anon || anon === 'xxx') {
  console.log('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY masih kosong atau xxx');
  process.exit(1);
}
if (anon.startsWith('sb_publishable_')) {
  console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY format publishable benar');
} else if (anon.startsWith('sb_secret_')) {
  console.log('⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY terisi secret key — seharusnya publishable key');
} else {
  console.log('❓ Format tidak dikenali:', anon.slice(0, 20));
}
