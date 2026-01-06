import { writable } from 'svelte/store';
import type { Song } from './server/data';

// Since Song is defined in server/data, we might need a shared type definition.
// For now, I'll redefine a partial type here to avoid importing server code in client.
export interface ClientSong {
	id: string;
	title: string;
	artist: string;
	path: string;
	duration?: number;
}

export const currentSong = writable<ClientSong | null>(null);
export const isPlaying = writable(false);
export const queue = writable<ClientSong[]>([]);
export const allSongs = writable<ClientSong[]>([]); // To help with previous/next
export const volume = writable(1.0);
export const isShuffle = writable(false);
export const repeatMode = writable<'off' | 'all' | 'one'>('off');

export const playlists = writable<{ id: string; name: string; songs: string[] }[]>([]);
export const likedSongs = writable<string[]>([]);
// We'll load this on mount
