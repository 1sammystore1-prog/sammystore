import { NextResponse } from 'next/server';
import { getMarkups, computeMarkup, toNgn } from '@/lib/pricing';
import { getListing } from '@/lib/accszone';

// Single-item detail lookup for buyacc1 (AccsZone). The bulk /api/accounts/products
// list endpoint doesn't carry the full `description` (buyer instructions) field -
// only the single listing endpoint does - so the product detail page hits this
// route to fill that in instead of trusting the list response.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const markups = await getMarkups();

  if (!process.env.ACCSZONE_API_KEY) {
    return NextResponse.json(
      { success: false, error: 'AccsZone API key not configured' },
      { status: 500 }
    );
  }

  const { id } = await params;
  const rawId = id.replace(/^buyacc1_/, '');

  try {
    const listing: any = await getListing(rawId);
    const product = {
      id: `buyacc1_${listing.id}`,
      name: listing.title,
      category: listing.subcategory?.title || listing.category?.title || 'Other',
      mainCategory: listing.category?.title || 'Other',
      price: computeMarkup(toNgn(parseFloat(listing.price) || 0), markups.accounts),
      stock: typeof listing.available_stock === 'number' ? listing.available_stock : null,
      instructions: listing.description || null,
      video: null,
      source: 'buyacc1',
    };

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'AccsZone network error' },
      { status: 500 }
    );
  }
}
