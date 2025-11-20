import { NextResponse } from 'next/server';
import { readJsonFile, writeJsonFile } from '@/lib/json-utils';

export async function GET() {
  try {
    const orders = await readJsonFile<any[]>('orders.json');
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json(
      { error: 'Buyurtmalarni olishda xatolik' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const newOrder = await request.json();
    const orders = await readJsonFile<any[]>('orders.json');

    const newId = Math.max(...orders.map(o => o.id), 0) + 1;
    const order = {
      ...newOrder,
      id: newId,
      createdAt: new Date().toISOString()
    };

    const updatedOrders = [...orders, order];
    await writeJsonFile('orders.json', updatedOrders);

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { error: 'Buyurtma qo\'shishda xatolik' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const updatedOrder = await request.json();
    const orders = await readJsonFile<any[]>('orders.json');

    const updatedOrders = orders.map(o =>
      o.id === updatedOrder.id ? { ...updatedOrder } : o
    );

    await writeJsonFile('orders.json', updatedOrders);
    return NextResponse.json(updatedOrder);
  } catch (error) {
    return NextResponse.json(
      { error: 'Buyurtmani yangilashda xatolik' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const orders = await readJsonFile<any[]>('orders.json');

    const updatedOrders = orders.filter(o => o.id !== id);
    await writeJsonFile('orders.json', updatedOrders);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Buyurtmani o\'chirishda xatolik' },
      { status: 500 }
    );
  }
}
