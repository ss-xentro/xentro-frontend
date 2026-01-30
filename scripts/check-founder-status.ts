/**
 * Script to check the current state of founder accounts
 */

import 'dotenv/config';
import { db } from '../db/client';
import { users, startups, teamMembers, startupFounders, startupSessions } from '../db/schemas';
import { eq } from 'drizzle-orm';

async function checkFounderStatus() {
  console.log('🔍 Checking founder account status...\n');

  // Check all users
  const allUsers = await db.select().from(users);
  console.log(`📊 Total users: ${allUsers.length}`);
  if (allUsers.length > 0) {
    console.log('\nUsers:');
    allUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.accountType}) - ID: ${user.id}`);
    });
  }

  // Check all startups
  const allStartups = await db.select().from(startups);
  console.log(`\n🚀 Total startups: ${allStartups.length}`);
  if (allStartups.length > 0) {
    console.log('\nStartups:');
    allStartups.forEach(startup => {
      console.log(`  - ${startup.name} - ID: ${startup.id}`);
      console.log(`    Owner ID: ${startup.ownerId}`);
    });
  }

  // Check all team members
  const allTeamMembers = await db.select().from(teamMembers);
  console.log(`\n👥 Total team members: ${allTeamMembers.length}`);
  if (allTeamMembers.length > 0) {
    console.log('\nTeam Members:');
    allTeamMembers.forEach(member => {
      console.log(`  - User: ${member.userId} → Startup: ${member.startupId}`);
      console.log(`    Role: ${member.role}`);
    });
  }

  // Check all startup founders
  const allFounders = await db.select().from(startupFounders);
  console.log(`\n👔 Total startup founders: ${allFounders.length}`);
  if (allFounders.length > 0) {
    console.log('\nStartup Founders:');
    allFounders.forEach(founder => {
      console.log(`  - ${founder.name} (${founder.email})`);
      console.log(`    User: ${founder.userId} → Startup: ${founder.startupId}`);
      console.log(`    Role: ${founder.role}, Primary: ${founder.isPrimary}`);
    });
  }

  // Check recent startup sessions
  const allSessions = await db.select().from(startupSessions);
  console.log(`\n🔐 Total startup sessions: ${allSessions.length}`);
  if (allSessions.length > 0) {
    console.log('\nRecent Sessions (last 5):');
    allSessions.slice(-5).forEach(session => {
      console.log(`  - ${session.email}`);
      console.log(`    Verified: ${session.verified}, Expires: ${session.expiresAt}`);
      console.log(`    Startup ID: ${session.startupId}`);
    });
  }

  console.log('\n✅ Check complete!');
}

checkFounderStatus().catch(console.error).finally(() => process.exit(0));
