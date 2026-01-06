import { json } from '@sveltejs/kit';
import { getSongs } from '$lib/server/data';

export function GET() {
	const songs = getSongs();
	return json(songs);
}
