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