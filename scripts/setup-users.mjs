/**
 * CarGA — User Setup Script
 * =========================
 * Creates the initial admin and test users in Supabase Auth.
 * The database trigger `handle_new_user()` auto-creates rows in the `users` table.
 * After auth users are created, this script populates their profile tables.
 *
 * Usage:
 *   node scripts/setup-users.mjs
 *
 * Requires:
 *   NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load env from .env.local
function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), '.env.local');
    const content = readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env.local not found — rely on environment variables
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('ERROR: Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

if (SUPABASE_URL.includes('placeholder')) {
  console.error('ERROR: Replace placeholder Supabase URL with your real project URL');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// ============================================
// USER DEFINITIONS
// ============================================

const USERS = [
  {
    email: 'diego.j.garnica@gmail.com',
    password: 'Mynewpassword2025!',
    role: 'admin',
    profile: null, // Admin doesn't need a marketplace profile
    description: 'Primary admin (Diego — CEO, Codexium)',
  },
  {
    email: 'testuser@carga.com.ar',
    password: 'CarGA-Test-2025!',
    role: 'transportista',
    profile: {
      table: 'profiles_transportista',
      data: {
        nombre: 'Juan',
        apellido: 'García',
        cuit: '20-28473691-4',
        telefono: '+5491112345678',
        whatsapp: '+5491112345678',
        provincia: 'Buenos Aires',
        ciudad: 'CABA',
        rating: 4.8,
        total_viajes: 47,
        verified: true,
        plan: 'profesional',
        habilitaciones: ['carga_general', 'cereales'],
        whatsapp_notifications: true,
      },
    },
    description: 'Test transportista user',
  },
  {
    email: 'testadmin@carga.com.ar',
    password: 'CarGA-Admin-2025!',
    role: 'admin',
    profile: null,
    description: 'Test admin user',
  },
];

// ============================================
// SETUP FUNCTIONS
// ============================================

async function createAuthUser(email, password, role) {
  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find((u) => u.email === email);

  if (existing) {
    console.log(`  ⏭️  User already exists: ${email} (id: ${existing.id})`);
    return existing;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Skip email verification
    user_metadata: { role },
  });

  if (error) {
    console.error(`  ❌ Failed to create ${email}:`, error.message);
    return null;
  }

  console.log(`  ✅ Created auth user: ${email} (id: ${data.user.id})`);
  return data.user;
}

async function ensureUserRole(userId, role) {
  // The trigger should have created the users row, but let's verify and fix if needed
  const { data: userRow } = await supabase
    .from('users')
    .select('id, role')
    .eq('id', userId)
    .single();

  if (!userRow) {
    // Trigger didn't fire — insert manually
    const { error } = await supabase
      .from('users')
      .insert({ id: userId, email: '', role });

    if (error) {
      console.log(`  ⚠️  Could not insert users row (trigger may handle this): ${error.message}`);
    }
    return;
  }

  if (userRow.role !== role) {
    await supabase
      .from('users')
      .update({ role })
      .eq('id', userId);
    console.log(`  🔄 Updated role to '${role}' for user ${userId}`);
  }
}

async function createProfile(userId, profileConfig) {
  if (!profileConfig) return;

  const { table, data } = profileConfig;

  // Check if profile exists
  const { data: existing } = await supabase
    .from(table)
    .select('id')
    .eq('user_id', userId)
    .single();

  if (existing) {
    console.log(`  ⏭️  Profile already exists in ${table}`);
    return;
  }

  const { error } = await supabase
    .from(table)
    .insert({ user_id: userId, ...data });

  if (error) {
    console.error(`  ❌ Failed to create profile in ${table}:`, error.message);
  } else {
    console.log(`  ✅ Created profile in ${table}`);
  }
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log('');
  console.log('🚛 CarGA — User Setup');
  console.log('=====================');
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log('');

  for (const userDef of USERS) {
    console.log(`\n📧 ${userDef.email} (${userDef.description})`);

    const user = await createAuthUser(userDef.email, userDef.password, userDef.role);
    if (!user) continue;

    await ensureUserRole(user.id, userDef.role);
    await createProfile(user.id, userDef.profile);
  }

  console.log('\n');
  console.log('✅ Setup complete!');
  console.log('');
  console.log('Test credentials:');
  console.log('─────────────────────────────────────────────────');
  console.log('Test User (Transportista):');
  console.log('  Email:    testuser@carga.com.ar');
  console.log('  Password: CarGA-Test-2025!');
  console.log('');
  console.log('Test Admin:');
  console.log('  Email:    testadmin@carga.com.ar');
  console.log('  Password: CarGA-Admin-2025!');
  console.log('─────────────────────────────────────────────────');
  console.log('');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
