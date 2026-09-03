export function getImageUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  return `${apiUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

export async function adminApiFetch(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  const headers = new Headers(options.headers || {});
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const res = await fetch(url, {
    ...options,
    headers,
  });
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      window.location.href = '/admin/login';
    }
    throw new Error('Could not validate credentials. Please log in again.');
  }
  return res;
}
