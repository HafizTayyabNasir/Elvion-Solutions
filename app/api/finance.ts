import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const decoded = authResult.user;
    if (!decoded || !decoded.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const category = searchParams.get('category');

    if (!action) {
      return NextResponse.json({ error: 'Missing action parameter' }, { status: 400 });
    }

    if (action === 'expenses') {
      const where: any = {};
      if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(startDate);
        if (endDate) where.date.lte = new Date(endDate);
      }
      if (category) where.category = category;

      const expenses = await prisma.expense.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { date: 'desc' },
      });
      return NextResponse.json(expenses);
    }

    if (action === 'budgets') {
      const where: any = {};
      if (category) where.category = category;
      const year = searchParams.get('year');
      if (year) where.year = parseInt(year);
      const month = searchParams.get('month');
      if (month) where.month = parseInt(month);

      const budgets = await prisma.budget.findMany({
        where,
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      });
      return NextResponse.json(budgets);
    }

    if (action === 'tax-entries') {
      const year = searchParams.get('year');
      const where: any = {};
      if (year) where.year = parseInt(year);

      const taxEntries = await prisma.taxEntry.findMany({
        where,
        orderBy: [{ year: 'desc' }, { quarter: 'desc' }],
      });
      return NextResponse.json(taxEntries);
    }

    if (action === 'alerts') {
      const alerts = await prisma.financialAlert.findMany({
        where: { isResolved: false },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(alerts);
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Error in finance API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const decoded = authResult.user;
    if (!decoded || !decoded.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    if (action === 'expense') {
      const { date, vendor, category, amount, currency, paymentMethod, isRecurring, receiptUrl, notes } = body;
      if (!date || !vendor || !category || amount === undefined) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      const expense = await prisma.expense.create({
        data: {
          date: new Date(date),
          vendor,
          category,
          amount: Math.round(amount),
          currency: currency || 'USD',
          paymentMethod,
          isRecurring: isRecurring || false,
          receiptUrl,
          notes,
          createdBy: decoded.userId,
        },
        include: { user: { select: { id: true, name: true, email: true } } },
      });
      return NextResponse.json(expense, { status: 201 });
    }

    if (action === 'budget') {
      const { year, month, category, plannedAmount, currency } = body;
      if (!year || !category || plannedAmount === undefined) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      const budget = await prisma.budget.upsert({
        where: { year_month_category: { year, month: month || 0, category } },
        update: { plannedAmount: Math.round(plannedAmount), currency: currency || 'USD' },
        create: {
          year,
          month: month || null,
          category,
          plannedAmount: Math.round(plannedAmount),
          currency: currency || 'USD',
        },
      });
      return NextResponse.json(budget, { status: 201 });
    }

    if (action === 'tax-entry') {
      const { quarter, year, estimatedLiability, amountSetAside, notes } = body;
      if (!quarter || !year || estimatedLiability === undefined) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      const taxEntry = await prisma.taxEntry.upsert({
        where: { quarter_year: { quarter, year } },
        update: { estimatedLiability: Math.round(estimatedLiability), amountSetAside: Math.round(amountSetAside), notes },
        create: { quarter, year, estimatedLiability: Math.round(estimatedLiability), amountSetAside: Math.round(amountSetAside), notes },
      });
      return NextResponse.json(taxEntry, { status: 201 });
    }

    if (action === 'alert-resolve') {
      const { alertId } = body;
      if (!alertId) {
        return NextResponse.json({ error: 'Missing alertId' }, { status: 400 });
      }

      const alert = await prisma.financialAlert.update({
        where: { id: alertId },
        data: { isResolved: true, resolvedAt: new Date() },
      });
      return NextResponse.json(alert);
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Error in finance API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
