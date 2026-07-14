import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Cart from '@/models/Cart';

function itemCost(item: { type: string; unitPrice: number; quantity: number }): number {
  return item.type === 'smm' ? (item.unitPrice * item.quantity) / 1000 : item.unitPrice * item.quantity;
}

function cartTotal(items: Array<{ type: string; unitPrice: number; quantity: number }>): number {
  return items.reduce((sum, item) => sum + itemCost(item), 0);
}

export async function GET(request: Request) {
  await dbConnect();
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ success: false, error: 'Please login' }, { status: 401 });

  const cart = await Cart.findOne({ userId });
  const items = cart?.items || [];

  return NextResponse.json({ success: true, items, total: cartTotal(items) });
}

export async function POST(request: Request) {
  await dbConnect();
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ success: false, error: 'Please login' }, { status: 401 });

  const { type, productId, name, category, unitPrice, quantity, link } = await request.json();
  const itemType: 'account' | 'smm' = type === 'smm' ? 'smm' : 'account';
  const qty = parseInt(String(quantity)) || 1;

  if (!productId || !name || typeof unitPrice !== 'number' || unitPrice <= 0 || qty <= 0) {
    return NextResponse.json({ success: false, error: 'Invalid item' }, { status: 400 });
  }
  if (itemType === 'smm' && (!link || typeof link !== 'string' || !link.trim())) {
    return NextResponse.json({ success: false, error: 'A target link is required for SMM orders' }, { status: 400 });
  }

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({ userId, items: [] });
  }

  const existing = cart.items.find((i) =>
    i.type === itemType &&
    i.productId === String(productId) &&
    (itemType === 'account' || i.link === link)
  );

  if (existing) {
    existing.quantity += qty;
  } else {
    cart.items.push({
      type: itemType,
      productId: String(productId),
      name,
      category,
      unitPrice,
      quantity: qty,
      link: itemType === 'smm' ? link : undefined,
    });
  }

  await cart.save();
  return NextResponse.json({ success: true, items: cart.items, total: cartTotal(cart.items) });
}

export async function DELETE(request: Request) {
  await dbConnect();
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ success: false, error: 'Please login' }, { status: 401 });

  const { productId, link } = await request.json().catch(() => ({ productId: null, link: null }));

  const cart = await Cart.findOne({ userId });
  if (!cart) return NextResponse.json({ success: true, items: [], total: 0 });

  if (productId) {
    cart.items = cart.items.filter((i) =>
      !(i.productId === String(productId) && (link === undefined || link === null || i.link === link))
    );
  } else {
    cart.items = [];
  }

  await cart.save();
  return NextResponse.json({ success: true, items: cart.items, total: cartTotal(cart.items) });
}
