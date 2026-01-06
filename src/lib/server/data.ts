import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..'); // Go up from src/lib/server to project root
const DOWNLOADS_DIR = path.join(PROJECT_ROOT, 'downloads');
const DB_FILE = path.join(PROJECT_ROOT, 'playlists.json');

console.log('[data.ts] PROJECT_ROOT:', PROJECT_ROOT);
console.log('[data.ts] DOWNLOADS_DIR:', DOWNLOADS_DIR);
console.log('[data.ts] DOWNLOADS_DIR exists:', fs.existsSync(DOWNLOADS_DIR));

export interface Song {
	id: string; // filename for now
	title: string;
	artist?: string; // We might not parse this yet, just use filename
	path: string;
	duration?: number;
}

export interface Playlist {
	id: string;
	name: string;
	description?: string;
	songs: string[]; // List of song IDs (filenames)
	createdAt: string;
}

// Ensure DB file exists
if (!fs.existsSync(DB_FILE)) {
	fs.writeFileSync(DB_FILE, JSON.stringify([]));
}

export const getSongs = (): Song[] => {
	if (!fs.existsSync(DOWNLOADS_DIR)) return [];

	const files = fs
		.readdirSync(DOWNLOADS_DIR)
		.filter((f) => f.endsWith('.mp3') || f.endsWith('.webm'));

	return files.map((file) => {
		// Simple parsing: "Artist - Title.mp3" or just "Title.mp3"
		const namePart = path.parse(file).name;
		const [artist, title] = namePart.includes(' - ')
			? namePart.split(' - ').map((s) => s.trim())
			: ['Unknown Artist', namePart];

		return {
			id: file,
			title: title || namePart,
			artist: artist || 'Unknown',
			path: file
		};
	});
};
