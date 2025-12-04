/**
 * Seed script to create initial admin user
 * Run with: npx tsx scripts/seed-admin.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcrypt'
import * as readline from 'readline'

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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve)
  })
}

async function seedAdmin() {
  try {
    console.log('🌱 Seeding initial admin user...\n')

    // Check if admin already exists
    const { data: existingAdmins } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'admin')
      .limit(1)

    // Get admin details (support command-line args or interactive)
    const args = process.argv.slice(2)
    const isCommandLine = args.length >= 3
    
    // Only prompt if using interactive mode and admin exists
    if (existingAdmins && existingAdmins.length > 0 && !isCommandLine) {
      console.log('⚠️  Admin user already exists!')
      const overwrite = await question('Do you want to create another admin? (y/n): ')
      if (overwrite.toLowerCase() !== 'y') {
        console.log('Cancelled.')
        rl.close()
        return
      }
    } else if (existingAdmins && existingAdmins.length > 0 && isCommandLine) {
      console.log('⚠️  Admin user already exists! Creating another admin...')
    }
    let email: string
    let name: string
    let pin: string

    if (args.length >= 3) {
      // Use command-line arguments
      email = args[0]
      name = args[1]
      pin = args[2]
      console.log(`Using provided credentials: ${email}`)
    } else {
      // Interactive mode
      email = await question('Admin email: ')
      name = await question('Admin name: ')
      pin = await question('Admin PIN (4 digits): ')
    }

    // Validate PIN
    if (!/^\d{4}$/.test(pin)) {
      console.error('❌ PIN must be exactly 4 digits')
      rl.close()
      return
    }

    // Hash PIN
    const saltRounds = 10
    const pinHash = await bcrypt.hash(pin, saltRounds)

    // Create admin user
    const { data: admin, error } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase().trim(),
        name: name.trim(),
        pin_hash: pinHash,
        role: 'admin',
        status: 'active',
        email_verified: true,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') { // Unique violation
        console.warn(`Admin user with email ${email} already exists.`)
      } else {
        console.error('❌ Error creating admin:', error.message)
      }
      rl.close()
      return
    }

    console.log('\n✅ Admin user created successfully!')
    console.log(`   ID: ${admin.id}`)
    console.log(`   Email: ${admin.email}`)
    console.log(`   Name: ${admin.name}`)
    console.log(`   PIN: ${pin}`)
    console.log('\n🎉 You can now login with this PIN!')

    rl.close()
  } catch (error) {
    console.error('❌ Error:', error)
    rl.close()
    process.exit(1)
  }
}

seedAdmin()
