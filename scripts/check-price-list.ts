/**
 * Check if a partner has a price list
 * Run with: npx tsx scripts/check-price-list.ts <partner-email>
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
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function checkPriceList() {
  try {
    const args = process.argv.slice(2)
    
    if (args.length < 1) {
      console.log('Usage: npx tsx scripts/check-price-list.ts <partner-email>')
      console.log('\nOr run without args to see all partners and their price lists:')
      console.log('npx tsx scripts/check-price-list.ts\n')
      
      // Show all partners and their price lists
      const { data: partners } = await supabase
        .from('users')
        .select('id, email, name, company')
        .eq('role', 'partner')
      
      if (!partners || partners.length === 0) {
        console.log('No partners found.')
        return
      }
      
      console.log('\n📋 All Partners and Price Lists:\n')
      
      for (const partner of partners) {
        const { data: priceList } = await supabase
          .from('price_lists')
          .select('*')
          .eq('partner_id', partner.id)
          .maybeSingle()
        
        console.log(`Partner: ${partner.name} (${partner.email})`)
        if (priceList) {
          console.log(`  ✅ Has price list (ID: ${priceList.id})`)
          console.log(`     Currency: ${priceList.currency}`)
          console.log(`     Monthly License: ${priceList.helium_license_monthly}`)
        } else {
          console.log(`  ❌ No price list found`)
        }
        console.log('')
      }
      
      return
    }

    const email = args[0]

    console.log(`🔍 Checking price list for: ${email}\n`)

    // Find partner
    const { data: partner, error: partnerError } = await supabase
      .from('users')
      .select('id, email, name, company')
      .eq('email', email.toLowerCase().trim())
      .eq('role', 'partner')
      .single()

    if (partnerError || !partner) {
      console.error('❌ Partner not found')
      process.exit(1)
    }

    console.log(`Found partner: ${partner.name} (ID: ${partner.id})\n`)

    // Check price list
    const { data: priceList, error: priceListError } = await supabase
      .from('price_lists')
      .select('*')
      .eq('partner_id', partner.id)
      .maybeSingle()

    if (priceListError) {
      console.error('❌ Error checking price list:', priceListError.message)
      process.exit(1)
    }

    if (priceList) {
      console.log('✅ Price list found!')
      console.log(`   ID: ${priceList.id}`)
      console.log(`   Currency: ${priceList.currency}`)
      console.log(`   Helium License (Monthly): ${priceList.helium_license_monthly}`)
      console.log(`   Helium License (Annual): ${priceList.helium_license_annual}`)
      console.log(`   Development Rate/Hour: ${priceList.development_rate_per_hour}`)
      console.log(`   Deployment Cost: ${priceList.deployment_cost}`)
      console.log(`   Maintenance Cost: ${priceList.maintenance_cost}`)
    } else {
      console.log('❌ No price list found for this partner')
      console.log('\n💡 To create a price list:')
      console.log('   1. Login to admin portal: http://admin.localhost:3000')
      console.log('   2. Go to "Price Lists" section')
      console.log('   3. Click "Create Price List"')
      console.log(`   4. Select partner: ${partner.name}`)
    }
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

checkPriceList()

