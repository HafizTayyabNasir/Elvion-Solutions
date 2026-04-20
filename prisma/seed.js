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

  let adminUser;
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
    adminUser = existingUser;
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    adminUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        isAdmin: true,
      },
    });
    
    console.log(`Admin user created with email: ${email} and password: ${password}`);
  }

  // Seed financial data
  await seedFinancialData(adminUser.id);
}

async function seedFinancialData(adminUserId) {
  console.log('Seeding financial data...');

  // Clear existing financial data
  await prisma.expense.deleteMany({});
  await prisma.budget.deleteMany({});
  await prisma.taxEntry.deleteMany({});
  await prisma.financialAlert.deleteMany({});

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Seed Expenses (6 months of realistic marketing agency expenses)
  const expenseCategories = [
    { name: 'software', monthlyRange: [50000, 100000] },      // $500-$1000
    { name: 'payroll', monthlyRange: [1000000, 1500000] },    // $10k-$15k
    { name: 'marketing', monthlyRange: [200000, 400000] },    // $2k-$4k
    { name: 'office', monthlyRange: [100000, 200000] },       // $1k-$2k
    { name: 'legal', monthlyRange: [25000, 75000] },          // $250-$750
    { name: 'other', monthlyRange: [50000, 150000] },         // $500-$1500
  ];

  const vendors = [
    { category: 'software', names: ['Adobe', 'Slack', 'Asana', 'Monday.com', 'Figma', 'GitHub Pro'] },
    { category: 'payroll', names: ['Salary', 'Contractor'] },
    { category: 'marketing', names: ['Google Ads', 'Facebook Ads', 'LinkedIn Ads'] },
    { category: 'office', names: ['Utilities', 'Internet', 'Office Rent'] },
    { category: 'legal', names: ['Accounting Firm', 'Legal Consultant'] },
    { category: 'other', names: ['Equipment', 'Supplies', 'Training'] },
  ];

  // Generate 6 months of expenses
  for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
    const expenseDate = new Date(currentYear, currentMonth - 1 - monthOffset, 15);
    
    for (const category of expenseCategories) {
      const vendors_for_category = vendors.find(v => v.category === category.name);
      const vendor = vendors_for_category.names[Math.floor(Math.random() * vendors_for_category.names.length)];
      
      const amount = Math.floor(Math.random() * (category.monthlyRange[1] - category.monthlyRange[0]) + category.monthlyRange[0]);

      await prisma.expense.create({
        data: {
          date: expenseDate,
          vendor,
          category: category.name,
          amount,
          currency: 'USD',
          paymentMethod: 'bank_transfer',
          isRecurring: ['software', 'payroll', 'office'].includes(category.name),
          notes: `Monthly ${category.name} expense for ${expenseDate.toLocaleDateString()}`,
          createdBy: adminUserId,
        },
      });
    }
  }
  console.log('✓ Expenses seeded');

  // Seed Budgets for current and next quarters
  const budgetCategories = [
    { name: 'revenue', quarterlyAmount: 10000000 },           // $100k
    { name: 'software', quarterlyAmount: 75000 },             // $750
    { name: 'payroll', quarterlyAmount: 450000 },             // $4500
    { name: 'marketing', quarterlyAmount: 150000 },           // $1500
    { name: 'office', quarterlyAmount: 60000 },               // $600
    { name: 'legal', quarterlyAmount: 30000 },                // $300
    { name: 'other', quarterlyAmount: 75000 },                // $750
  ];

  for (let m = 1; m <= 12; m++) {
    for (const budget of budgetCategories) {
      try {
        await prisma.budget.upsert({
          where: {
            year_month_category: {
              year: currentYear,
              month: m,
              category: budget.name,
            },
          },
          update: {},
          create: {
            year: currentYear,
            month: m,
            category: budget.name,
            plannedAmount: Math.floor(budget.quarterlyAmount / 3),
            currency: 'USD',
          },
        });
      } catch (e) {
        // Unique constraint might fail, continue
      }
    }
  }
  console.log('✓ Budgets seeded');

  // Seed Tax Entries (current year)
  const quarters = [1, 2, 3, 4];
  for (const quarter of quarters) {
    try {
      await prisma.taxEntry.upsert({
        where: {
          quarter_year: {
            quarter,
            year: currentYear,
          },
        },
        update: {},
        create: {
          quarter,
          year: currentYear,
          estimatedLiability: 250000, // $2500 per quarter (estimated 25% effective tax rate on ~$10k/month net)
          amountSetAside: 250000,
          notes: `Q${quarter} ${currentYear} tax provision`,
        },
      });
    } catch (e) {
      // Unique constraint might fail, continue
    }
  }
  console.log('✓ Tax entries seeded');

  // Seed Financial Alerts
  const alertsToCreate = [
    {
      type: 'runway',
      message: 'Current runway is 8 months. Consider increasing revenue or reducing burn rate.',
      severity: 'warning',
      metadata: JSON.stringify({ monthsRemaining: 8, threshold: 6 }),
    },
    {
      type: 'burn_rate',
      message: 'Monthly burn rate increased 5% compared to previous month.',
      severity: 'info',
      metadata: JSON.stringify({ currentBurn: 1850000, previousBurn: 1761905, percentChange: 5 }),
    },
    {
      type: 'concentration',
      message: 'Revenue concentration risk: Top client represents 35% of total revenue.',
      severity: 'info',
      metadata: JSON.stringify({ topClientPercentage: 35, threshold: 40 }),
    },
  ];

  for (const alert of alertsToCreate) {
    await prisma.financialAlert.create({
      data: alert,
    });
  }
  console.log('✓ Financial alerts seeded');

  console.log('Financial data seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

