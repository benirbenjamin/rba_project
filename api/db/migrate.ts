import { query } from './pool.js';

export async function runMigrations() {
  console.log('🔄 Running database migrations (auto-creating tables if not exist)...');

  try {
    // 1. Enable uuid-ossp or pgcrypto if possible (catch if not superuser)
    try {
      await query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    } catch (e) {
      // Ignore if extension creation not permitted (gen_random_uuid is built-in in PG 13+)
    }

    // 2. Users Table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'ADMIN',
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    // 3. Stations Table
    await query(`
      CREATE TABLE IF NOT EXISTS stations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        logo_url TEXT,
        stream_url TEXT NOT NULL,
        stream_type VARCHAR(50) NOT NULL DEFAULT 'AUDIO',
        station_type VARCHAR(50) NOT NULL DEFAULT 'RADIO',
        location VARCHAR(255),
        frequency VARCHAR(50),
        accent_color VARCHAR(50) DEFAULT '#0284c7',
        status VARCHAR(50) NOT NULL DEFAULT 'ONLINE',
        is_active BOOLEAN NOT NULL DEFAULT true,
        is_featured BOOLEAN NOT NULL DEFAULT false,
        display_order INT NOT NULL DEFAULT 0,
        last_checked_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    // 4. Categories Table
    await query(`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) UNIQUE NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        display_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    // 5. Videos Table
    await query(`
      CREATE TABLE IF NOT EXISTS videos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        original_url TEXT NOT NULL,
        embed_url TEXT NOT NULL,
        platform VARCHAR(50) NOT NULL DEFAULT 'youtube',
        video_id VARCHAR(100),
        thumbnail_url TEXT,
        category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
        publication_date DATE NOT NULL DEFAULT CURRENT_DATE,
        views_count INT NOT NULL DEFAULT 0,
        is_featured BOOLEAN NOT NULL DEFAULT false,
        is_published BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    // 6. Anonymous Visitors Table
    await query(`
      CREATE TABLE IF NOT EXISTS visitors (
        id VARCHAR(100) PRIMARY KEY,
        first_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        device_type VARCHAR(50),
        browser VARCHAR(100),
        os VARCHAR(100),
        country VARCHAR(100) DEFAULT 'Rwanda'
      );
    `);

    // 7. Visitor Sessions Table
    await query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR(100) PRIMARY KEY,
        visitor_id VARCHAR(100) REFERENCES visitors(id) ON DELETE CASCADE,
        started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        ended_at TIMESTAMP WITH TIME ZONE,
        referrer TEXT,
        traffic_source VARCHAR(50) DEFAULT 'Direct'
      );
    `);

    // 8. Page Views Table
    await query(`
      CREATE TABLE IF NOT EXISTS page_views (
        id BIGSERIAL PRIMARY KEY,
        session_id VARCHAR(100) REFERENCES sessions(id) ON DELETE CASCADE,
        visitor_id VARCHAR(100) REFERENCES visitors(id) ON DELETE CASCADE,
        page_path VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    // 9. Media Events Table
    await query(`
      CREATE TABLE IF NOT EXISTS media_events (
        id BIGSERIAL PRIMARY KEY,
        event_type VARCHAR(50) NOT NULL,
        station_id UUID REFERENCES stations(id) ON DELETE SET NULL,
        video_id UUID REFERENCES videos(id) ON DELETE SET NULL,
        session_id VARCHAR(100) REFERENCES sessions(id) ON DELETE CASCADE,
        visitor_id VARCHAR(100) REFERENCES visitors(id) ON DELETE CASCADE,
        page_url TEXT,
        device_type VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    // 10. Site Settings Table
    await query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        key VARCHAR(100) PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    // Indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_stations_active ON stations (is_active, display_order);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_stations_slug ON stations (slug);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_videos_published ON videos (is_published, publication_date DESC);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_videos_category ON videos (category_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_videos_slug ON videos (slug);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views (created_at);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_media_events_created_at ON media_events (created_at);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_media_events_type ON media_events (event_type);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON sessions (started_at);`);

    console.log('✅ Database migrations applied successfully.');
  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  }
}

// Allow direct run via node/tsx
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
