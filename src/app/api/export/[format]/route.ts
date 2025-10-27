import { NextRequest, NextResponse } from 'next/server';
import { exportService } from '@/services/export';

export async function POST(
  request: NextRequest,
  { params }: { params: { format: string } }
) {
  try {
    const { format } = params;
    const planData = await request.json();
    
    if (format === 'excel') {
      const buffer = await exportService.exportToExcel(planData);
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="bali-financial-plan.xlsx"',
        },
      });
    } else if (format === 'pdf') {
      const buffer = await exportService.exportToPDF(planData);
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="bali-financial-plan.pdf"',
        },
      });
    } else {
      return NextResponse.json(
        { error: 'Unsupported export format' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Export API error:', error);
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    );
  }
}