import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: string;
  email: string;
}

export function getUserId(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  
  const token = authHeader.split(' ')[1];
  if (!token) return null;
  
  // FIX #5: Provide fallback for JWT_SECRET with clear error
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET environment variable is not set');
    return null;
  }
  
  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    return decoded.id;
  } catch (e) {
    // Log invalid token attempts (security audit trail)
    console.warn('JWT verification failed:', e instanceof Error ? e.message : 'Unknown error');
    return null; 
  }
}
