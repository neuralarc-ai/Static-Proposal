/**
 * Script to list all admin users
 * Run with: npx tsx scripts/list-admins.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function listAdmins() {
  try {
    console.log('🔍 Fetching all admin users...\n')

    const { data: admins, error } = await supabase
      .from('users')
      .select('id, email, name, role, status, created_at, last_login_at')
      .eq('role', 'admin')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching admins:', error.message)
      process.exit(1)
    }

    if (!admins || admins.length === 0) {
      console.log('⚠️  No admin users found in database.')
      console.log('💡 Run: npm run seed:admin -- <email> "<name>" <pin>')
      process.exit(0)
    }

    console.log(`✅ Found ${admins.length} admin user(s):\n`)
    
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.name}`)
      console.log(`   Email: ${admin.email}`)
      console.log(`   Status: ${admin.status}`)
      console.log(`   Created: ${new Date(admin.created_at).toLocaleString()}`)
      if (admin.last_login_at) {
        console.log(`   Last Login: ${new Date(admin.last_login_at).toLocaleString()}`)
      }
      console.log(`   ID: ${admin.id}`)
      console.log('')
    })

    console.log('💡 To update a PIN, run:')
    console.log('   npm run update:admin-pin -- <email> <pin>')
    console.log('\n💡 To create a new admin, run:')
    console.log('   npm run seed:admin -- <email> "<name>" <pin>')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

listAdmins()

