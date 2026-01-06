# Playlist Local

Local music player with playlist management using SvelteKit and Supabase.

## Prerequisites

- Node.js (Latest LTS recommended)
- Supabase Project

## Installation

1. Install dependencies:

```bash
npm install
```

2. Environment Configuration:
   Create a `.env` file in the root directory and add your Supabase credentials:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Database Schema Setup:
   Execute the following SQL in your Supabase SQL Editor to initialize the required tables and extensions:

```sql
create extension if not exists "uuid-ossp";

create table playlists (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  songs text[] default '{}',
  created_at timestamp with time zone default now()
);

create table liked_songs (
  id uuid primary key default uuid_generate_v4(),
  song_id text not null unique,
  created_at timestamp with time zone default now()
);
```

4. Local Assets:

- Create a `downloads` directory in the project root.
- Place audio files (`.mp3`, `.webm`) in the `downloads` folder.
- Metadata is extracted from filenames. Recommended format: `Artist - Title.mp3`.

## Development

Run the development server:

```bash
npm run dev
```

## Production

Build for production:

```bash
npm run build
```

![localhost_5174](https://github.com/user-attachments/assets/546b257f-82fc-43fc-a195-70e55d2dca2c)

