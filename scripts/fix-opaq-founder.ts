/**
 * Fix the OPAQ startup founder record
 */

import 'dotenv/config';
import { db } from '../db/client';
import { startups, startupFounders, users } from '../db/schemas';
import { eq } from 'drizzle-orm';

async function fixOpaqFounder() {
  console.log('🔧 Fixing OPAQ startup founder...\n');

  // Get the OPAQ startup
  const [opaqStartup] = await db
    .select()
    .from(startups)
    .where(eq(startups.name, 'OPAQ'))
    .limit(1);

  if (!opaqStartup) {
    console.log('❌ OPAQ startup not found');
    return;
  }

  console.log(`✅ Found OPAQ startup: ${opaqStartup.id}`);
  console.log(`   Owner ID: ${opaqStartup.ownerId}`);
  console.log(`   Primary Contact: ${opaqStartup.primaryContactEmail}`);

  // Check if founder record already exists
  const [existingFounder] = await db
    .select()
    .from(startupFounders)
    .where(eq(startupFounders.startupId, opaqStartup.id))
    .limit(1);

  if (existingFounder) {
    console.log('\n✅ Founder record already exists. Nothing to fix.');
    return;
  }

  // Get the owner user
  if (!opaqStartup.ownerId) {
    console.log('\n❌ No owner ID set for OPAQ startup');
    return;
  }

  const [ownerUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, opaqStartup.ownerId))
    .limit(1);

  if (!ownerUser) {
    console.log('\n❌ Owner user not found');
    return;
  }

  console.log(`\n👤 Owner: ${ownerUser.name} (${ownerUser.email})`);
  console.log(`   Account Type: ${ownerUser.accountType}`);

  // Update the owner's account type to 'startup' if needed
  if (ownerUser.accountType !== 'startup') {
    console.log('\n🔄 Updating owner account type to "startup"...');
    await db
      .update(users)
      .set({ accountType: 'startup' })
      .where(eq(users.id, ownerUser.id));
    console.log('✅ Account type updated');
  }

  // Create the founder record
  console.log('\n➕ Creating startupFounders record...');
  await db.insert(startupFounders).values({
    startupId: opaqStartup.id,
    userId: ownerUser.id,
    name: ownerUser.name,
    email: ownerUser.email,
    role: 'founder',
    isPrimary: true,
  });
  console.log('✅ Founder record created');

  console.log('\n🎉 OPAQ startup fixed! The founder can now log in.');
}

fixOpaqFounder().catch(console.error).finally(() => process.exit(0));
