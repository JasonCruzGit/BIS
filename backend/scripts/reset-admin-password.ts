import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function resetAdminPassword() {
  try {
    const email = process.env.ADMIN_EMAIL || 'admin@barangay.gov.ph';
    const newPassword = process.env.ADMIN_PASSWORD || 'p@ssword123';

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`❌ User with email ${email} not found!`);
      console.log('Creating new admin user...');
      
      // Create new admin user
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const admin = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN',
          isActive: true,
        },
      });

      console.log('✅ Admin user created successfully!');
      console.log('📧 Email:', email);
      console.log('🔑 Password:', newPassword);
      return;
    }

    // Reset password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        isActive: true, // Ensure user is active
      },
    });

    console.log('✅ Admin password reset successfully!');
    console.log('📧 Email:', email);
    console.log('🔑 New Password:', newPassword);
    console.log('👤 Name:', `${user.firstName} ${user.lastName}`);
    console.log('🔐 Role:', user.role);
    console.log('✅ Status: Active');
    console.log('\n⚠️  Please change the password after first login!');
  } catch (error: any) {
    console.error('❌ Error resetting admin password:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();

