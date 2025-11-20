import { NextResponse } from 'next/server';
import { readJsonFile, writeJsonFile } from '@/lib/json-utils';

export async function GET() {
  try {
    const zapchastlar = await readJsonFile<any[]>('zapchastlar.json');
    return NextResponse.json(zapchastlar);
  } catch (error) {
    return NextResponse.json(
      { error: 'Ma\'lumotlarni olishda xatolik' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const newZapchast = await request.json();
    const zapchastlar = await readJsonFile<any[]>('zapchastlar.json');

    const newId = Math.max(...zapchastlar.map(z => z.id), 0) + 1;
    const zapchast = {
      ...newZapchast,
      id: newId,
      createdAt: new Date().toISOString()
    };

    const updatedZapchastlar = [...zapchastlar, zapchast];
    await writeJsonFile('zapchastlar.json', updatedZapchastlar);

    return NextResponse.json(zapchast);
  } catch (error) {
    return NextResponse.json(
      { error: 'Zapchast qo\'shishda xatolik' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const updatedZapchast = await request.json();
    const zapchastlar = await readJsonFile<any[]>('zapchastlar.json');

    const updatedZapchastlar = zapchastlar.map(z =>
      z.id === updatedZapchast.id ? { ...updatedZapchast } : z
    );

    await writeJsonFile('zapchastlar.json', updatedZapchastlar);
    return NextResponse.json(updatedZapchast);
  } catch (error) {
    return NextResponse.json(
      { error: 'Zapchastni yangilashda xatolik' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const zapchastlar = await readJsonFile<any[]>('zapchastlar.json');

    const updatedZapchastlar = zapchastlar.filter(z => z.id !== id);
    await writeJsonFile('zapchastlar.json', updatedZapchastlar);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Zapchastni o\'chirishda xatolik' },
      { status: 500 }
    );
  }
}
