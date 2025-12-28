/**
 * Decode JWT token without verification
 * Note: This only decodes the token, it doesn't verify the signature
 */
export function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

/**
 * Extract user information from JWT token
 */
export function getUserFromToken(token: string): {
  id: string;
  email: string;
  role: string;
  userId?: number;
} | null {
  const decoded = decodeJWT(token);
  if (!decoded) return null;

  return {
    id: decoded.userId?.toString() || decoded.sub || '',
    email: decoded.sub || decoded.email || '',
    role: decoded.role || '',
    userId: decoded.userId,
  };
}

