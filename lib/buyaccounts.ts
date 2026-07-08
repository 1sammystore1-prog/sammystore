import axios from 'axios';

const BASE_URL = 'https://www.danotp.com.ng/stubs/buy-accounts.php';

export async function buyAccountsRequest(action: string, params: Record<string, any> = {}) {
  const apiKey = process.env.YOUR_DANOTP_API_KEY;
  
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
