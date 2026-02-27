import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const fullName = formData.get('fullName') as string;
    const personalEmail = formData.get('personalEmail') as string;
    const universityEmail = (formData.get('universityEmail') as string) || null;
    const fieldOfInterest = formData.get('fieldOfInterest') as string;
    const expectations = (formData.get('expectations') as string) || null;
    const cvFile = formData.get('cv') as File | null;

    let cvFileName: string | null = null;
    let cvFileData: string | null = null;
    let cvFileType: string | null = null;

    if (cvFile && cvFile.size > 0) {
      cvFileName = cvFile.name;
      cvFileType = cvFile.type;
      
      // Convert file to base64
      const arrayBuffer = await cvFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      cvFileData = buffer.toString('base64');
    }

    await prisma.internshipApplication.create({
      data: {
        fullName,
        personalEmail,
        universityEmail,
        fieldOfInterest,
        expectations,
        cvFileName,
        cvFileData,
        cvFileType,
        cvFileUrl: null, // Keep for backward compatibility
      },
    });

    return NextResponse.json({ message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Internship application error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const applications = await prisma.internshipApplication.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Get internship applications error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

