/**
 * Update admin PIN
 * Run with: npx tsx scripts/update-admin-pin.ts <email> <pin>
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcrypt'

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function updateAdminPin() {
  try {
    const args = process.argv.slice(2)
    
    if (args.length < 2) {
      console.error('Usage: npx tsx scripts/update-admin-pin.ts <email> <pin>')
      process.exit(1)
    }

    const email = args[0]
    const pin = args[1]

    // Validate PIN
    if (!/^\d{4}$/.test(pin)) {
      console.error('❌ PIN must be exactly 4 digits')
      process.exit(1)
    }

    console.log(`🔐 Updating admin PIN for: ${email}\n`)

    // Find admin user
    const { data: admin, error: findError } = await supabase
      .from('users')
      .select('id, email, name, role')
      .eq('email', email.toLowerCase().trim())
      .eq('role', 'admin')
      .single()

    if (findError || !admin) {
      console.error('❌ Admin user not found')
      process.exit(1)
    }

    // Hash new PIN
    const pinHash = await bcrypt.hash(pin, 10)

    // Update PIN
    const { error: updateError } = await supabase
      .from('users')
      .update({ pin_hash: pinHash })
      .eq('id', admin.id)

    if (updateError) {
      console.error('❌ Error updating PIN:', updateError.message)
      process.exit(1)
    }

    console.log('✅ Admin PIN updated successfully!')
    console.log(`   Email: ${admin.email}`)
    console.log(`   Name: ${admin.name}`)
    console.log(`   New PIN: ${pin}`)
    console.log(`\n🎉 You can now login with PIN: ${pin}`)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

updateAdminPin()

