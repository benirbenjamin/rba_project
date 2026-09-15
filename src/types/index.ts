export type StationType = 'RADIO' | 'TV';
export type StreamType = 'AUDIO' | 'HLS' | 'VIDEO';
export type StationStatus = 'ONLINE' | 'OFFLINE' | 'ERROR' | 'UNKNOWN';

export interface Station {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  stream_url: string;
  stream_type: StreamType;
  station_type: StationType;
  location?: string;
  frequency?: string;
  accent_color?: string;
  status: StationStatus;
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
  last_checked_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  display_order: number;
  video_count?: number;
}

export interface Video {
  id: string;
  title: string;
  slug: string;
  description: string;
  original_url: string;
  embed_url: string;
  platform: string;
  video_id?: string;
  thumbnail_url?: string;
  category_id?: string;
  category_name?: string;
  category_slug?: string;
  publication_date: string;
  views_count: number;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'SUPER_ADMIN' | 'ADMIN';
  is_active: boolean;
  created_at: string;
}

export interface SiteSettings {
  site_name: string;
  site_description: string;
  logo_url: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  facebook_url: string;
  twitter_url: string;
  youtube_url: string;
  instagram_url: string;
  footer_text: string;
}

export interface AnalyticsOverview {
  totalVisitors: number;
  visitorsToday: number;
  visitorsYesterday: number;
  visitorsThisWeek: number;
  visitorsThisMonth: number;
  visitorsThisYear: number;
  radioPlaysToday: number;
  tvPlaysToday: number;
  videoViewsToday: number;
  totalPageViews: number;
}

export interface TimeseriesPoint {
  date_label: string;
  page_views: number;
  radio_plays: number;
  tv_plays: number;
  video_views: number;
}

export interface NameValueMetric {
  name: string;
  value: number;
}

export interface TopStationMetric {
  id: string;
  name: string;
  logo_url: string;
  frequency?: string;
  plays: number;
}

export interface TopVideoMetric {
  id: string;
  title: string;
  thumbnail_url?: string;
  views_count: number;
  recent_plays: number;
}

export interface AnalyticsChartsData {
  timeseries: TimeseriesPoint[];
  trafficSources: NameValueMetric[];
  devices: NameValueMetric[];
  browsers: NameValueMetric[];
  operatingSystems: NameValueMetric[];
  topStations: TopStationMetric[];
  topVideos: TopVideoMetric[];
}
