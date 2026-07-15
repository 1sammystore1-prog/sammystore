/**
 * The accounts provider's `buyProduct` response mixes real account
 * credentials together with internal bookkeeping fields - status flags,
 * localized status messages, its own raw price, and internal IDs. None of
 * that belongs in front of a customer, so this strips it down to just the
 * actual account details before it's stored in Transaction.metadata or
 * shown on the Orders page.
 */
export function cleanAccountData(raw: any): any {
  if (!raw || typeof raw !== 'object') return raw;

  // If the response has a field that's clearly the account details
  // themselves (by name), prefer that and drop everything else entirely.
  const detailKey = Object.keys(raw).find((k) => /^(data|account|details?|login|credentials?|info)$/i.test(k));
  if (detailKey) {
    return { 'Account Details': raw[detailKey] };
  }

  // Otherwise, fall back to stripping known noise field names - status
  // flags, messages, the provider's own price/currency, and any kind of
  // internal ID - and keep whatever's left.
  const noisePattern = /^(status|success|message|msg|error|note|price|cost|rate|currency|amount|.*id)$/i;
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!noisePattern.test(key)) cleaned[key] = value;
  }

  // If everything got filtered out (unexpected shape), better to show the
  // raw response than nothing at all - the buyer still needs their account.
  return Object.keys(cleaned).length > 0 ? cleaned : raw;
}
