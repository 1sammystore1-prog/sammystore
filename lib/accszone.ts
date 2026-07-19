import axios from 'axios';

const BASE_URL = 'https://accszone.com/api/v1';

async function accszoneRequest(method: 'GET' | 'POST', path: string, params?: Record<string, any>, body?: Record<string, any>) {
  const apiKey = process.env.ACCSZONE_API_KEY;
  if (!apiKey) throw new Error('AccsZone API key not configured');

  const url = new URL(BASE_URL + path);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }

  const response = await axios({
    method,
    url: url.toString(),
    headers: {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json',
    },
    data: body,
    timeout: 10000,
    validateStatus: () => true,
  });

  // Per AccsZone's docs, every response is { success, message, data } -
  // including error responses, so `message` is always safe to surface.
  if (response.status >= 400 || response.data?.success === false) {
    throw new Error(response.data?.message || `AccsZone API error (HTTP ${response.status})`);
  }

  return response.data;
}

export interface AccszoneListing {
  id: number;
  title: string;
  slug: string;
  price: string;
  available_stock: number;
  sold?: number;
  category?: { id: number; title: string; slug: string };
  subcategory?: { id: number; title: string; slug: string };
  description?: string;
}

// Walks every page of /listings (max 100 per page per their docs) to
// return the full catalog in one call, so callers don't need to deal
// with pagination themselves.
export async function getAllListings(): Promise<AccszoneListing[]> {
  const all: AccszoneListing[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const data = await accszoneRequest('GET', '/listings', { per_page: perPage, page });
    if (!data?.success || !Array.isArray(data.data)) break;
    all.push(...data.data);

    const meta = data.meta;
    if (!meta || page >= meta.last_page) break;
    page++;
  }

  return all;
}

// The bulk /listings endpoint used by getAllListings() above only returns
// summary fields for catalog browsing - it does not include the full
// `description` text. That has to be fetched per-item from the single
// listing endpoint instead, same as HStora's getProduct() below.
export async function getListing(id: number | string): Promise<AccszoneListing> {
  const data = await accszoneRequest('GET', `/listings/`);
  return data.data;
}

export interface AccszonePurchaseResult {
  order_id: number;
  listing: string;
  quantity: number;
  amount: string;
  discount: string;
  new_balance: string;
  accounts: string[];
  purchased_at: string;
}

export async function purchaseListing(
  adId: number | string,
  quantity: number,
  promoCode?: string
): Promise<AccszonePurchaseResult> {
  const body: Record<string, any> = { ad_id: Number(adId), quantity };
  if (promoCode) body.promo_code = promoCode;

  const data = await accszoneRequest('POST', '/purchase', undefined, body);
  return data.data;
}
