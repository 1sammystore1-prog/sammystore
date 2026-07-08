import axios from 'axios';

const BASE_URL = 'https://5sim.net/v1/user';

export async function fiveSimRequest(endpoint: string, method: 'GET' | 'POST' = 'GET', params: any = {}) {
  const apiKey = process.env.FIVESIM_API_KEY;
  
  if (!apiKey) throw new Error('5sim API key not configured');

  const url = `${BASE_URL}${endpoint}`;
  
  const config: any = {
    method,
    url,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    timeout: 10000
  };

  if (method === 'GET') {
    config.params = params;
  } else {
    config.data = params;
  }

  try {
    const response = await axios(config);
    return response.data;
  } catch (error: any) {
    // Log detailed error for debugging
    const errorDetails = {
      url,
      method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    };
    console.error('5sim API Error:', JSON.stringify(errorDetails, null, 2));
    
    if (error.response?.status === 404) {
      throw new Error('5sim: Account may have no balance or invalid endpoint');
    }
    throw new Error(`5sim API error (${error.response?.status || 'Unknown'}): ${error.message}`);
  }
}
