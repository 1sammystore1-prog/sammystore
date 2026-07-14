import axios from 'axios';

const BASE_URL = 'https://justanotherpanel.com/api/v2';

export async function japRequest(action: string, params: Record<string, any> = {}) {
  const apiKey = process.env.JAP_API_KEY;
  
  if (!apiKey) throw new Error('JAP API key not configured');

  const response = await axios.post(BASE_URL, new URLSearchParams({
    key: apiKey,
    action,
    ...params
  }));

  // JAP returns HTTP 200 even on failure, with the error in the JSON body
  // (e.g. {"error": "Not enough funds"} or {"error": "Invalid link"}).
  // Axios has no way to catch this on its own, so without this check a
  // failed order/service-list call was silently treated as success -
  // orders got marked successful with an undefined order id, and the
  // services list quietly came back empty/broken.
  if (response.data && typeof response.data === 'object' && !Array.isArray(response.data) && response.data.error) {
    throw new Error(response.data.error);
  }

  return response.data;
}
