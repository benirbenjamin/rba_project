import {
  Station,
  Video,
  Category,
  User,
  SiteSettings,
  AnalyticsOverview,
  AnalyticsChartsData,
} from '../types';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('rba_admin_token');
  const visitorId = localStorage.getItem('rba_visitor_id') || '';
  const sessionId = sessionStorage.getItem('rba_session_id') || '';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-visitor-id': visitorId,
    'x-session-id': sessionId,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

// Stations API
export async function getStations(params?: { type?: string; featured?: boolean; include_inactive?: boolean }): Promise<Station[]> {
  const query = new URLSearchParams();
  if (params?.type) query.append('type', params.type);
  if (params?.featured) query.append('featured', 'true');
  if (params?.include_inactive) query.append('include_inactive', 'true');

  const res = await fetch(`${API_BASE}/stations?${query.toString()}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load stations');
  return res.json();
}

export async function getStationBySlug(slug: string): Promise<Station> {
  const res = await fetch(`${API_BASE}/stations/${encodeURIComponent(slug)}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Station not found');
  return res.json();
}

export async function createStation(data: Partial<Station>): Promise<Station> {
  const res = await fetch(`${API_BASE}/stations`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create station');
  }
  return res.json();
}

export async function updateStation(id: string, data: Partial<Station>): Promise<Station> {
  const res = await fetch(`${API_BASE}/stations/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update station');
  }
  return res.json();
}

export async function deleteStation(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/stations/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete station');
}

export async function testStreamDiagnostic(url: string) {
  const res = await fetch(`${API_BASE}/stations/test-url`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ url }),
  });
  return res.json();
}

// Videos API
export async function getVideos(params?: {
  category?: string;
  featured?: boolean;
  q?: string;
  page?: number;
  limit?: number;
  include_unpublished?: boolean;
}): Promise<{ data: Video[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
  const query = new URLSearchParams();
  if (params?.category) query.append('category', params.category);
  if (params?.featured) query.append('featured', 'true');
  if (params?.q) query.append('q', params.q);
  if (params?.page) query.append('page', params.page.toString());
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.include_unpublished) query.append('include_unpublished', 'true');

  const res = await fetch(`${API_BASE}/videos?${query.toString()}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load videos');
  return res.json();
}

export async function getVideoDetail(idOrSlug: string): Promise<{ video: Video; relatedVideos: Video[] }> {
  const res = await fetch(`${API_BASE}/videos/${encodeURIComponent(idOrSlug)}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Video not found');
  return res.json();
}

export async function createVideo(data: Partial<Video>): Promise<Video> {
  const res = await fetch(`${API_BASE}/videos`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create video');
  }
  return res.json();
}

export async function updateVideo(id: string, data: Partial<Video>): Promise<Video> {
  const res = await fetch(`${API_BASE}/videos/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update video');
  }
  return res.json();
}

export async function deleteVideo(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/videos/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete video');
}

// Categories API
export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/categories`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load categories');
  return res.json();
}

// Analytics API
export async function trackEvent(event: {
  event_type: 'PAGE_VIEW' | 'RADIO_PLAY' | 'RADIO_STOP' | 'TV_PLAY' | 'VIDEO_PLAY' | 'VIDEO_VIEW';
  station_id?: string;
  video_id?: string;
  page_url?: string;
  referrer?: string;
}) {
  const visitorId = localStorage.getItem('rba_visitor_id') || '';
  const sessionId = sessionStorage.getItem('rba_session_id') || '';

  try {
    await fetch(`${API_BASE}/analytics/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...event,
        visitor_id: visitorId,
        session_id: sessionId,
        referrer: event.referrer || document.referrer || '',
        page_url: event.page_url || window.location.href,
      }),
    });
  } catch (e) {
    // Fail silently in client
  }
}

export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  const res = await fetch(`${API_BASE}/analytics/overview`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load analytics overview');
  return res.json();
}

export async function getAnalyticsCharts(range: string = '7d', startDate?: string, endDate?: string): Promise<AnalyticsChartsData> {
  const query = new URLSearchParams({ range });
  if (startDate) query.append('startDate', startDate);
  if (endDate) query.append('endDate', endDate);

  const res = await fetch(`${API_BASE}/analytics/charts?${query.toString()}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load analytics charts');
  return res.json();
}

// Users API (Super Admin)
export async function getUsers(): Promise<User[]> {
  const res = await fetch(`${API_BASE}/admin/users`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load users');
  return res.json();
}

export async function createUser(data: { email: string; full_name: string; password: string; role: string }): Promise<User> {
  const res = await fetch(`${API_BASE}/admin/users`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create user');
  }
  return res.json();
}

export async function updateUser(id: string, data: Partial<User & { password?: string }>): Promise<User> {
  const res = await fetch(`${API_BASE}/admin/users/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update user');
  }
  return res.json();
}

export async function deleteUser(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/users/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete user');
}

// Settings API
export async function getSettings(): Promise<SiteSettings> {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

export async function updateSettings(data: SiteSettings): Promise<void> {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update settings');
}

// Global Search
export async function globalSearch(q: string) {
  const res = await fetch(`${API_BASE}/settings/search/all?q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}
