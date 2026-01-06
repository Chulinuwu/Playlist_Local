import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');
const DOWNLOADS_DIR = path.join(PROJECT_ROOT, 'downloads');
const DB_FILE = path.join(PROJECT_ROOT, 'playlists.json');

export interface Song {
	id: string;
	title: string;
	artist?: string;
	path: string;
	duration?: number;
}

export interface Playlist {
	id: string;
	name: string;
	description?: string;
	songs: string[];
	createdAt: string;
}

if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify([]));

export const getSongs = (): Song[] => {
	if (!fs.existsSync(DOWNLOADS_DIR)) return [];
	const files = fs
		.readdirSync(DOWNLOADS_DIR)
		.filter((f) => f.endsWith('.mp3') || f.endsWith('.webm'));
	return files.map((file) => {
		const namePart = path.parse(file).name;
		const [artist, title] = namePart.includes(' - ')
			? namePart.split(' - ').map((s) => s.trim())
			: ['Unknown Artist', namePart];
		return { id: file, title: title || namePart, artist: artist || 'Unknown', path: file };
	});
};
