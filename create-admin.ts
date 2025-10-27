/**
 * Script to create admin user
 * Run: npx tsx create-admin.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🔐 Creating admin user...');

    const email = 'emir@admin.com';
    const password = 'Mallman12';
    const name = 'Emir';

    // Check if admin already exists
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      console.log('⚠️  Admin user already exists, updating password and role...');

      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          role: 'admin',
          name: 'Emir',
        },
      });

      console.log('✅ Admin user updated successfully!');
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash(password, 10);

      const admin = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'admin',
          isActive: true,
        },
      });

      console.log('✅ Admin user created successfully!');
      console.log(`📧 Email: ${admin.email}`);
      console.log(`👤 Name: ${admin.name}`);
      console.log(`🔑 Password: ${password}`);
      console.log(`🎯 Role: ${admin.role}`);
    }

    console.log('\n🎉 You can now login with:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
