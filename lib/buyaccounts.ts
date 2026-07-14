import axios from 'axios';

const BASE_URL = 'https://www.benotp.com/stubs/buy-accounts.php';

export async function buyAccountsRequest(action: string, params: Record<string, any> = {}) {
  const apiKey = process.env.BENOTP_API_KEY;
  
  if (!apiKey) {
    throw new Error('API key not configured');
  }

  const response = await axios.get(BASE_URL, {
    params: {
      action,
      api_key: apiKey,
      ...params
    }
  });

  return response.data;
}
