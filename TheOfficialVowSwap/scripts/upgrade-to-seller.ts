const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function upgradeToSeller() {
  const email = 'jdarsinos1@gmail.com';
  
  try {
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.error('User not found');
      return;
    }

    // Update user role to SELLER
    await prisma.user.update({
      where: { id: user.id },
      data: { role: 'SELLER' }
    });

    // Create seller profile if it doesn't exist
    const existingSeller = await prisma.seller.findUnique({
      where: { userId: user.id }
    });

    if (!existingSeller) {
      await prisma.seller.create({
        data: {
          userId: user.id,
          storeName: `${user.name || 'New'}'s Store`,
          contactEmail: email,
        }
      });
    }

    console.log('Successfully upgraded user to seller');
  } catch (error) {
    console.error('Error upgrading user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

upgradeToSeller();