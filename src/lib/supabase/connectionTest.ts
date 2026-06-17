import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testConnection() {
  console.log('Testing Supabase connection...')
  const { data, error } = await supabase
    .from('restaurant_settings')
    .select('*')
    .limit(1)

  if (error) {
    console.error('❌ Connection test failed:', error.message)
    process.exit(1)
  }

  if (data && data.length > 0) {
    console.log('✅ Connection test successful! Found restaurant_settings row:', data[0].restaurant_name)
  } else {
    console.log('✅ Connection test successful! (Table exists but is empty)')
  }
}

testConnection()
