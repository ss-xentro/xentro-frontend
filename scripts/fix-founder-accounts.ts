/**
 * Migration script to fix existing founder accounts
 * 
 * This script:
 * 1. Updates all users who are linked to startups via teamMembers to accountType='startup'
 * 2. Creates missing startupFounders records from teamMembers
 * 
 * Run with: npx tsx scripts/fix-founder-accounts.ts
 */

import 'dotenv/config';
import { db } from '../db/client';
import { users, startups, teamMembers, startupFounders } from '../db/schemas';
import { eq, inArray } from 'drizzle-orm';

async function fixFounderAccounts() {
  console.log('🔧 Fixing founder accounts...\n');

  try {
    // Step 1: Find all users who are team members of startups
    const allTeamMembers = await db
      .select({
        userId: teamMembers.userId,
        startupId: teamMembers.startupId,
        role: teamMembers.role,
      })
      .from(teamMembers);

    if (allTeamMembers.length === 0) {
      console.log('✅ No team members found. Nothing to fix.');
      return;
    }

    console.log(`📊 Found ${allTeamMembers.length} team member records`);

    // Get unique user IDs
    const userIds = [...new Set(allTeamMembers.map(tm => tm.userId))];
    console.log(`👥 Processing ${userIds.length} unique users...\n`);

    // Step 2: Update accountType for these users to 'startup'
    if (userIds.length > 0) {
      const updatedUsers = await db
        .update(users)
        .set({ accountType: 'startup' })
        .where(inArray(users.id, userIds))
        .returning();

      console.log(`✅ Updated ${updatedUsers.length} users to accountType='startup'`);
    }

    // Step 3: For each team member, create a startupFounders record if it doesn't exist
    let createdCount = 0;
    let skippedCount = 0;

    for (const member of allTeamMembers) {
      // Get user details
      const user = await db.query.users.findFirst({
        where: eq(users.id, member.userId),
      });

      if (!user) {
        console.warn(`⚠️  User ${member.userId} not found, skipping...`);
        continue;
      }

      // Get startup details
      const startup = await db.query.startups.findFirst({
        where: eq(startups.id, member.startupId),
      });

      if (!startup) {
        console.warn(`⚠️  Startup ${member.startupId} not found, skipping...`);
        continue;
      }

      // Check if startupFounders record already exists
      const existingFounder = await db.query.startupFounders.findFirst({
        where: eq(startupFounders.userId, member.userId),
      });

      if (existingFounder) {
        skippedCount++;
        continue;
      }

      // Determine if this is the primary founder (startup owner)
      const isPrimary = startup.ownerId === user.id;

      // Map role
      let founderRole: 'ceo' | 'cto' | 'coo' | 'cfo' | 'cpo' | 'founder' | 'co_founder' = 'co_founder';
      if (member.role?.toLowerCase().includes('ceo')) founderRole = 'ceo';
      else if (member.role?.toLowerCase().includes('cto')) founderRole = 'cto';
      else if (member.role?.toLowerCase().includes('coo')) founderRole = 'coo';
      else if (member.role?.toLowerCase().includes('cfo')) founderRole = 'cfo';
      else if (member.role?.toLowerCase().includes('cpo')) founderRole = 'cpo';
      else if (isPrimary || member.role?.toLowerCase().includes('founder')) founderRole = 'founder';

      // Create startupFounders record
      try {
        await db.insert(startupFounders).values({
          startupId: member.startupId,
          userId: member.userId,
          name: user.name,
          email: user.email,
          role: founderRole,
          isPrimary,
        });
        createdCount++;
        console.log(`  ✓ Created startupFounders record for ${user.name} (${user.email})`);
      } catch (error: any) {
        if (error.code === '23505') {
          // Unique constraint violation - record already exists
          skippedCount++;
        } else {
          console.error(`  ✗ Error creating record for ${user.email}:`, error.message);
        }
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`  - Created: ${createdCount} new startupFounders records`);
    console.log(`  - Skipped: ${skippedCount} (already exist)`);
    console.log(`\n✅ Migration complete!`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run the migration
fixFounderAccounts()
  .then(() => {
    console.log('\n🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
