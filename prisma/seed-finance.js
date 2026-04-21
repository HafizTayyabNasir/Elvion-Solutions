/**
 * Comprehensive financial seed for Elvion Solutions admin demo
 * Creates realistic 12-month history for a digital marketing agency:
 *   - Contacts (clients)
 *   - Projects (with directCosts)
 *   - ProjectPayments (monthly retainers + one-time)
 *   - Invoices + InvoiceItems (paid, sent, overdue)
 *   - Expenses (12 months, by category)
 *   - Budgets (full year)
 *   - TaxEntries (quarterly)
 *   - FinancialAlerts
 *   - Employees + Payroll (current month)
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[rand(0, arr.length - 1)];

async function main() {
  console.log('🚀 Starting comprehensive financial seed…');

  // ── ENSURE ADMIN USER ─────────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL || 'team@elvionsolutions.com';
  let adminUser = await prisma.user.findFirst({ where: { isAdmin: true } });
  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Admin User',
        password: await bcrypt.hash('adminpassword', 10),
        isAdmin: true,
        isVerified: true,
      },
    });
    console.log('  ✓ Admin user created');
  }
  const adminId = adminUser.id;

  // ── CLEAR EXISTING FINANCIAL DATA ─────────────────────────────────────────
  await prisma.financialAlert.deleteMany({});
  await prisma.taxEntry.deleteMany({});
  await prisma.budget.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.invoiceItem.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.projectPayment.deleteMany({});
  console.log('  ✓ Cleared existing financial records');

  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth(); // 0-indexed

  // ── CONTACTS / CLIENTS ────────────────────────────────────────────────────
  const clientData = [
    { name: 'Ali Hassan', email: 'ali@nexusmedia.pk', company: 'Nexus Media PK', position: 'CEO' },
    { name: 'Sarah Malik', email: 'sarah@techbridge.io', company: 'TechBridge Solutions', position: 'Marketing Director' },
    { name: 'Ahmed Raza', email: 'ahmed@growthlabs.co', company: 'GrowthLabs Co.', position: 'Founder' },
    { name: 'Fatima Noor', email: 'fatima@urbanretail.pk', company: 'Urban Retail PK', position: 'CMO' },
    { name: 'Usman Tariq', email: 'usman@velocitysaas.com', company: 'Velocity SaaS', position: 'VP Marketing' },
    { name: 'Zara Khan', email: 'zara@brandpulse.pk', company: 'BrandPulse Digital', position: 'Director' },
  ];

  const contacts = [];
  for (const c of clientData) {
    let contact = await prisma.contact.findFirst({ where: { email: c.email } });
    if (!contact) {
      contact = await prisma.contact.create({
        data: { ...c, userId: adminId },
      });
    }
    contacts.push(contact);
  }
  console.log(`  ✓ ${contacts.length} client contacts ready`);

  // ── PROJECTS ──────────────────────────────────────────────────────────────
  const projectTemplates = [
    { name: 'SEO & Content Strategy', contact: 0, budget: 360000, directCosts: 720000, monthlyRetainer: 300000 },
    { name: 'Social Media Management', contact: 1, budget: 180000, directCosts: 360000, monthlyRetainer: 150000 },
    { name: 'PPC Campaign Management', contact: 2, budget: 240000, directCosts: 960000, monthlyRetainer: 200000 },
    { name: 'Website Redesign', contact: 3, budget: 600000, directCosts: 240000, monthlyRetainer: 0 },
    { name: 'Email Marketing & Automation', contact: 4, budget: 120000, directCosts: 180000, monthlyRetainer: 100000 },
    { name: 'Brand Identity & Design', contact: 5, budget: 300000, directCosts: 120000, monthlyRetainer: 0 },
  ];

  const projects = [];
  for (let i = 0; i < projectTemplates.length; i++) {
    const t = projectTemplates[i];
    let project = await prisma.project.findFirst({
      where: { name: t.name, ownerId: adminId },
    });
    if (!project) {
      const startDate = new Date(curYear, curMonth - 10, 1);
      project = await prisma.project.create({
        data: {
          name: t.name,
          description: `Full-service ${t.name.toLowerCase()} for ${clientData[t.contact].company}`,
          status: i < 4 ? 'active' : 'completed',
          priority: ['high', 'medium', 'high', 'urgent', 'medium', 'low'][i],
          budget: t.budget / 100,
          directCosts: t.directCosts,
          progress: rand(40, 95),
          startDate,
          endDate: i >= 4 ? new Date(curYear, curMonth - 1, 28) : null,
          ownerId: adminId,
          contactId: contacts[t.contact].id,
        },
      });
    }
    projects.push({ ...project, template: t });
  }
  console.log(`  ✓ ${projects.length} projects ready`);

  // ── PROJECT PAYMENTS (12 months retainer + one-time) ──────────────────────
  let paymentSeq = 1;
  for (const p of projects) {
    const { template } = p;
    if (template.monthlyRetainer > 0) {
      // 12 months of monthly retainer payments
      for (let m = 11; m >= 0; m--) {
        const payDate = new Date(curYear, curMonth - m, 5);
        const amount = (template.monthlyRetainer / 100) * (1 + rand(-5, 5) / 100); // slight variance
        await prisma.projectPayment.create({
          data: {
            projectId: p.id,
            amount: Math.round(amount * 100) / 100,
            status: m > 0 ? 'received' : (rand(0, 1) ? 'received' : 'pending'),
            category: 'monthly',
            label: `${payDate.toLocaleString('default', { month: 'long' })} ${payDate.getFullYear()} Retainer`,
            currency: 'USD',
            paymentDate: payDate,
          },
        });
        paymentSeq++;
      }
    } else {
      // One-time project payment split into 3 milestones
      const milestones = [
        { label: 'Deposit (50%)', pct: 0.5, offset: -8 },
        { label: 'Milestone 1 (30%)', pct: 0.3, offset: -4 },
        { label: 'Final Payment (20%)', pct: 0.2, offset: -1 },
      ];
      for (const ms of milestones) {
        const payDate = new Date(curYear, curMonth + ms.offset, rand(10, 20));
        await prisma.projectPayment.create({
          data: {
            projectId: p.id,
            amount: Math.round((template.budget * ms.pct) / 100 * 100) / 100,
            status: ms.offset < 0 ? 'received' : 'pending',
            category: 'module',
            label: ms.label,
            currency: 'USD',
            paymentDate: ms.offset < 0 ? payDate : null,
          },
        });
      }
    }
  }
  console.log('  ✓ Project payments seeded (12 months)');

  // ── INVOICES ──────────────────────────────────────────────────────────────
  const serviceItems = [
    'SEO Audit & Strategy', 'Content Creation (10 articles)', 'On-page SEO Optimization',
    'Social Media Management (30 posts)', 'Paid Search Campaign Setup', 'Analytics & Reporting',
    'Email Campaign Design & Send', 'Landing Page Design', 'Brand Consultation (5 hrs)',
    'Google Ads Management Fee', 'Facebook/Meta Ads Management', 'Monthly Retainer Fee',
  ];

  let invoiceNum = 1;
  const invoiceStatuses = ['paid', 'paid', 'paid', 'paid', 'sent', 'overdue', 'sent', 'draft'];

  for (let m = 11; m >= 0; m--) {
    const issueDate = new Date(curYear, curMonth - m, rand(1, 10));
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + 30);

    // 2-4 invoices per month
    const invoiceCount = rand(2, 4);
    for (let i = 0; i < invoiceCount; i++) {
      const contact = contacts[rand(0, contacts.length - 1)];
      const project = projects[rand(0, projects.length - 1)];
      const status = m > 2
        ? 'paid'
        : m === 0 || m === 1
          ? pick(invoiceStatuses)
          : 'paid';

      const numItems = rand(1, 3);
      const items = [];
      let subtotal = 0;
      for (let j = 0; j < numItems; j++) {
        const qty = rand(1, 5);
        const unitPrice = rand(200, 2000);
        const total = qty * unitPrice;
        subtotal += total;
        items.push({ description: pick(serviceItems), quantity: qty, unitPrice, total });
      }
      const tax = Math.round(subtotal * 0.13); // 13% tax
      const total = subtotal + tax;

      const inv = await prisma.invoice.create({
        data: {
          number: `INV-${String(invoiceNum++).padStart(4, '0')}`,
          status,
          issueDate,
          dueDate,
          subtotal,
          tax,
          total,
          currency: 'USD',
          notes: 'Thank you for your business. Payment due within 30 days.',
          projectId: project.id,
          userId: adminId,
          items: {
            create: items,
          },
        },
      });
    }
  }
  console.log('  ✓ Invoices seeded (12 months)');

  // ── EXPENSES (12 months) ──────────────────────────────────────────────────
  const expenseDefs = [
    { category: 'payroll', vendors: ['Monthly Salaries', 'Contractor Fees'], range: [1200000, 1800000], recurring: true },
    { category: 'software', vendors: ['Adobe Creative Cloud', 'Slack', 'Asana', 'Figma Pro', 'Monday.com', 'GitHub Pro', 'Zoom Pro', 'Google Workspace'], range: [60000, 120000], recurring: true },
    { category: 'marketing', vendors: ['Google Ads Budget', 'Facebook Ads', 'LinkedIn Ads', 'SEMrush Subscription'], range: [200000, 500000], recurring: false },
    { category: 'office', vendors: ['Office Rent', 'Electricity Bill', 'Internet (PTCL)', 'Office Supplies'], range: [80000, 160000], recurring: true },
    { category: 'legal', vendors: ['Accounting Firm PK', 'Legal Consultant', 'FBR Registration Fee'], range: [20000, 80000], recurring: false },
    { category: 'other', vendors: ['Team Training', 'Equipment Purchase', 'Courier/Shipping', 'Bank Charges'], range: [30000, 100000], recurring: false },
  ];

  for (let m = 11; m >= 0; m--) {
    const expMonth = new Date(curYear, curMonth - m, 1);
    for (const def of expenseDefs) {
      // 1-2 expenses per category per month
      const count = def.category === 'payroll' ? 1 : rand(1, 2);
      for (let k = 0; k < count; k++) {
        const day = rand(1, 28);
        await prisma.expense.create({
          data: {
            date: new Date(expMonth.getFullYear(), expMonth.getMonth(), day),
            vendor: pick(def.vendors),
            category: def.category,
            amount: rand(def.range[0], def.range[1]),
            currency: 'USD',
            paymentMethod: pick(['bank_transfer', 'credit_card', 'bank_transfer', 'cash']),
            isRecurring: def.recurring,
            notes: `${def.category} expense — ${expMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
            createdBy: adminId,
          },
        });
      }
    }
  }
  console.log('  ✓ Expenses seeded (12 months)');

  // ── BUDGETS (full year, monthly) ──────────────────────────────────────────
  const budgetDefs = [
    { category: 'payroll', monthly: 1500000 },
    { category: 'software', monthly: 90000 },
    { category: 'marketing', monthly: 350000 },
    { category: 'office', monthly: 120000 },
    { category: 'legal', monthly: 50000 },
    { category: 'other', monthly: 75000 },
    { category: 'revenue', monthly: 3000000 }, // $30k target
  ];

  for (let m = 1; m <= 12; m++) {
    for (const b of budgetDefs) {
      await prisma.budget.upsert({
        where: { year_month_category: { year: curYear, month: m, category: b.category } },
        update: {},
        create: { year: curYear, month: m, category: b.category, plannedAmount: b.monthly, currency: 'USD' },
      });
    }
    // Also annual budgets (month=0 via null, but our upsert uses 0)
  }
  console.log('  ✓ Budgets seeded (full year)');

  // ── TAX ENTRIES ───────────────────────────────────────────────────────────
  const taxRates = [0.25, 0.25, 0.25, 0.25]; // 25% effective rate
  for (let q = 1; q <= 4; q++) {
    // Estimate based on quarterly revenue (~$90k/quarter) × 25% tax
    const estimatedQRevenue = 9000000; // $90k in cents
    const liability = Math.round(estimatedQRevenue * taxRates[q - 1] * 0.1); // 2.5% net effective
    await prisma.taxEntry.upsert({
      where: { quarter_year: { quarter: q, year: curYear } },
      update: {},
      create: {
        quarter: q,
        year: curYear,
        estimatedLiability: liability,
        amountSetAside: Math.round(liability * (q <= (curMonth + 1) / 3 ? 1 : 0.75)),
        notes: `Q${q} ${curYear} — Income Tax (FBR) + WHT provision`,
      },
    });
  }
  console.log('  ✓ Tax entries seeded');

  // ── FINANCIAL ALERTS ──────────────────────────────────────────────────────
  const alerts = [
    {
      type: 'runway',
      message: 'Runway is 9.2 months. Healthy but watch burn rate — target >12 months.',
      severity: 'warning',
      metadata: JSON.stringify({ monthsRemaining: 9.2, threshold: 6 }),
    },
    {
      type: 'concentration',
      message: 'Nexus Media PK represents 38% of revenue. Consider diversifying client base.',
      severity: 'warning',
      metadata: JSON.stringify({ client: 'Nexus Media PK', pct: 38, threshold: 40 }),
    },
    {
      type: 'overdue',
      message: '3 invoices are overdue by more than 30 days totalling $8,400.',
      severity: 'critical',
      metadata: JSON.stringify({ count: 3, totalCents: 840000 }),
    },
    {
      type: 'burn_rate',
      message: 'Monthly burn rate increased 8% vs last month ($18,200 → $19,656).',
      severity: 'info',
      metadata: JSON.stringify({ current: 1965600, previous: 1820000, pctChange: 8 }),
    },
  ];
  for (const a of alerts) {
    await prisma.financialAlert.create({ data: a });
  }
  console.log('  ✓ Financial alerts seeded');

  // ── DEPARTMENTS ───────────────────────────────────────────────────────────
  const deptNames = ['Strategy & Consulting', 'Creative & Design', 'SEO & Content', 'Paid Media', 'Operations'];
  const depts = [];
  for (const name of deptNames) {
    let d = await prisma.department.findUnique({ where: { name } });
    if (!d) d = await prisma.department.create({ data: { name } });
    depts.push(d);
  }
  console.log('  ✓ Departments ready');

  // ── EMPLOYEES ─────────────────────────────────────────────────────────────
  const employeeData = [
    { firstName: 'Bilal', lastName: 'Ahmed', email: 'bilal@elvion.internal', employeeId: 'ELV-001', salary: 3500, type: 'full_time', dept: 0 },
    { firstName: 'Sara', lastName: 'Qureshi', email: 'sara@elvion.internal', employeeId: 'ELV-002', salary: 2800, type: 'full_time', dept: 1 },
    { firstName: 'Hassan', lastName: 'Mirza', email: 'hassan@elvion.internal', employeeId: 'ELV-003', salary: 2400, type: 'full_time', dept: 2 },
    { firstName: 'Amna', lastName: 'Sheikh', email: 'amna@elvion.internal', employeeId: 'ELV-004', salary: 2200, type: 'full_time', dept: 3 },
    { firstName: 'Kamran', lastName: 'Baig', email: 'kamran@elvion.internal', employeeId: 'ELV-005', salary: 1800, type: 'full_time', dept: 4 },
    { firstName: 'Nadia', lastName: 'Hussain', email: 'nadia@elvion.internal', employeeId: 'ELV-006', salary: 1500, type: 'contract', dept: 1 },
    { firstName: 'Faisal', lastName: 'Iqbal', email: 'faisal@elvion.internal', employeeId: 'ELV-007', salary: 1200, type: 'contract', dept: 2 },
  ];

  const employees = [];
  for (const e of employeeData) {
    let emp = await prisma.employee.findUnique({ where: { employeeId: e.employeeId } });
    if (!emp) {
      emp = await prisma.employee.create({
        data: {
          employeeId: e.employeeId,
          firstName: e.firstName,
          lastName: e.lastName,
          email: e.email,
          employmentType: e.type,
          status: 'active',
          salary: e.salary,
          currency: 'USD',
          hireDate: new Date(curYear - rand(0, 2), rand(0, 11), rand(1, 28)),
          positions: [e.dept === 0 ? 'Strategy Lead' : e.dept === 1 ? 'Designer' : e.dept === 2 ? 'SEO Specialist' : e.dept === 3 ? 'PPC Manager' : 'Operations Lead'],
          departments: { connect: [{ id: depts[e.dept].id }] },
        },
      });
    }
    employees.push(emp);
  }
  console.log(`  ✓ ${employees.length} employees ready`);

  // ── PAYROLL (last 3 months) ───────────────────────────────────────────────
  for (let mOff = 2; mOff >= 0; mOff--) {
    const pMonth = ((curMonth - mOff + 12) % 12) + 1;
    const pYear = curMonth - mOff < 0 ? curYear - 1 : curYear;
    const isPaid = mOff > 0;

    for (const emp of employees) {
      const base = emp.salary || 0;
      const bonus = mOff === 1 ? rand(0, 200) : 0; // bonus last month
      const deductions = rand(50, 150);
      const taxAmt = Math.round(base * 0.1);
      const netPay = base + bonus - deductions - taxAmt;

      await prisma.payroll.upsert({
        where: { employeeId_month_year: { employeeId: emp.id, month: pMonth, year: pYear } },
        update: {},
        create: {
          employeeId: emp.id,
          month: pMonth,
          year: pYear,
          baseSalary: base,
          bonus,
          deductions,
          tax: taxAmt,
          netPay,
          currency: 'USD',
          status: isPaid ? 'paid' : 'processed',
          paidDate: isPaid ? new Date(pYear, pMonth - 1, 28) : null,
        },
      });
    }
  }
  console.log('  ✓ Payroll records seeded (3 months)');

  console.log('\n🎉 Financial seed complete! Dashboard is ready with 12 months of data.');
  console.log('   Login:', adminEmail, '/ password: adminpassword');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
