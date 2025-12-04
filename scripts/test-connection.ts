/**
 * Test Supabase database connection
 * Run with: npx tsx scripts/test-connection.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function testConnection() {
  try {
    console.log('🔌 Testing Supabase connection...\n')

    // Test 1: Check if we can connect
    console.log('1. Testing connection...')
    const { data, error } = await supabase.from('users').select('count').limit(1)

    if (error) {
      console.error('❌ Connection failed:', error.message)
      console.error('\n💡 Make sure:')
      console.error('   - Database tables are created (run migrations/001_initial_schema.sql)')
      console.error('   - SUPABASE_SERVICE_ROLE_KEY is correct')
      process.exit(1)
    }

    console.log('✅ Connection successful!\n')

    // Test 2: Check tables exist
    console.log('2. Checking tables...')
    const tables = ['users', 'price_lists', 'proposals', 'proposal_requests', 'sessions', 'audit_logs']
    
    for (const table of tables) {
      const { error: tableError } = await supabase.from(table).select('*').limit(1)
      if (tableError) {
        console.error(`❌ Table "${table}" not found or not accessible`)
        console.error(`   Error: ${tableError.message}`)
      } else {
        console.log(`   ✅ Table "${table}" exists`)
      }
    }

    console.log('\n🎉 All tests passed! Database is ready.')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

testConnection()

