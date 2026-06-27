import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const jwtSecret = process.env.JWT_SECRET

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in frontend/.env.local')
}

if (!jwtSecret) {
  console.warn('JWT_SECRET is missing. Kitchen login will not issue tokens until it is configured.')
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function upsertAuthUser(email: string, password: string) {
  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (created.user) {
    return created.user
  }

  if (!createError?.message.toLowerCase().includes('already')) {
    throw createError
  }

  const { data: users, error: listError } = await supabase.auth.admin.listUsers()

  if (listError) {
    throw listError
  }

  const existingUser = users.users.find((user) => user.email === email)

  if (!existingUser) {
    throw new Error(`Unable to find existing user for ${email}`)
  }

  const { data: updated, error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
    password,
    email_confirm: true,
  })

  if (updateError) {
    throw updateError
  }

  return updated.user
}

async function createTestUsers() {
  const restaurantUser = await upsertAuthUser('admin@muncherz.com', 'Muncherz@123')
  await supabase.from('staff_accounts').upsert(
    {
      user_id: restaurantUser.id,
      name: 'Restaurant Admin',
      role: 'owner',
      is_active: true,
    },
    { onConflict: 'user_id' }
  )
  console.log('Restaurant admin ready: admin@muncherz.com')

  const developerUser = await upsertAuthUser('dev@muncherz.com', 'DevMuncherz@123')
  await supabase.from('developers').upsert(
    {
      user_id: developerUser.id,
      name: 'Developer',
      is_active: true,
    },
    { onConflict: 'user_id' }
  )
  console.log('Developer ready: dev@muncherz.com')

  const { data: existingScreen, error: screenLookupError } = await supabase
    .from('kitchen_screens')
    .select('id')
    .eq('name', 'Main Kitchen')
    .maybeSingle()

  if (screenLookupError) {
    throw screenLookupError
  }

  const pinHash = await bcrypt.hash('1234', 10)
  const kitchenScreenPayload = {
      name: 'Main Kitchen',
      pin: pinHash,
      is_active: true,
      failed_attempts: 0,
      lockout_until: null,
    }

  if (existingScreen) {
    await supabase.from('kitchen_screens').update(kitchenScreenPayload).eq('id', existingScreen.id)
  } else {
    await supabase.from('kitchen_screens').insert(kitchenScreenPayload)
  }
  console.log('Kitchen screen ready: PIN 1234')

  console.log('')
  console.log('All test users created.')
  console.log('Login credentials:')
  console.log('Restaurant: admin@muncherz.com / Muncherz@123')
  console.log('Developer:  dev@muncherz.com / DevMuncherz@123')
  console.log('Kitchen PIN: 1234')
}

createTestUsers().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
