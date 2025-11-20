import { NextResponse } from 'next/server';
import { readJsonFile, writeJsonFile } from '@/lib/json-utils';

export async function GET() {
  try {
    const mashinalar = await readJsonFile<any[]>('mashinalar.json');
    return NextResponse.json(mashinalar);
  } catch (error) {
    return NextResponse.json(
      { error: 'Ma\'lumotlarni olishda xatolik' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const newMashina = await request.json();
    const mashinalar = await readJsonFile<any[]>('mashinalar.json');

    const newId = Math.max(...mashinalar.map(m => m.id), 0) + 1;
    const mashina = {
      ...newMashina,
      id: newId,
      createdAt: new Date().toISOString()
    };

    const updatedMashinalar = [...mashinalar, mashina];
    await writeJsonFile('mashinalar.json', updatedMashinalar);

    return NextResponse.json(mashina);
  } catch (error) {
    return NextResponse.json(
      { error: 'Mashina qo\'shishda xatolik' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const updatedMashina = await request.json();
    const mashinalar = await readJsonFile<any[]>('mashinalar.json');

    const updatedMashinalar = mashinalar.map(m =>
      m.id === updatedMashina.id ? { ...updatedMashina } : m
    );

    await writeJsonFile('mashinalar.json', updatedMashinalar);
    return NextResponse.json(updatedMashina);
  } catch (error) {
    return NextResponse.json(
      { error: 'Mashinani yangilashda xatolik' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const mashinalar = await readJsonFile<any[]>('mashinalar.json');

    const updatedMashinalar = mashinalar.filter(m => m.id !== id);
    await writeJsonFile('mashinalar.json', updatedMashinalar);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Mashinani o\'chirishda xatolik' },
      { status: 500 }
    );
  }
}
