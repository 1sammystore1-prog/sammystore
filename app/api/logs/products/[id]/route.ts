import { NextResponse } from 'next/server';
import { getMarkups, computeMarkup, toNgn } from '@/lib/pricing';
import { getProduct, inferHstoraCategory } from '@/lib/hstora';

// Single-item detail lookup for buyacc2 (HStora). The bulk /api/logs/products
// list endpoint doesn't carry the full `description`/`short_description`
// (buyer instructions) field - only the single product endpoint does - so
// the product detail page hits this route to fill that in instead of
// trusting the list response.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const markups = await getMarkups();

  if (!process.env.HSTORA_API_KEY || !process.env.HSTORA_API_SECRET) {
    return NextResponse.json(
      { success: false, error: 'HStora API key not configured' },
      { status: 500 }
    );
  }

  const { id } = await params;
  const rawId = id.replace(/^buyacc2_/, '');

  try {
    const listing = await getProduct(rawId);
    const category = inferHstoraCategory(listing.name, listing as unknown as Record<string, any>);
    const product = {
      id: `buyacc2_${listing.id}`,
      name: listing.name,
      category,
      mainCategory: category,
      price: computeMarkup(
        listing.currency && listing.currency.toUpperCase() !== 'USD'
          ? (listing.price || 0)
          : toNgn(listing.price || 0),
        markups.accounts
      ),
      stock: typeof listing.stock_available === 'number' ? listing.stock_available : null,
      instructions: listing.description || listing.short_description || null,
      video: null,
      source: 'buyacc2',
    };

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'HStora network error' },
      { status: 500 }
    );
  }
}
