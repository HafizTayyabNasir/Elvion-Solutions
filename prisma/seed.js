const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'team@elvionsolutions.com';
  const password = 'adminpassword';
  const name = 'Admin User';

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log('Admin user already exists.');
    
    // Ensure it is admin
    if (!existingUser.isAdmin) {
        await prisma.user.update({
            where: { email },
            data: { isAdmin: true }
        });
        console.log('Updated existing user to admin.');
    }
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        isAdmin: true,
      },
    });
    
    console.log(`Admin user created with email: ${email} and password: ${password}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
