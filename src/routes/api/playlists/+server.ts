import { json } from '@sveltejs/kit';
import { supabase } from '$lib/server/supabase';

import type { RequestHandler } from './$types';

export async function GET() {
	const { data, error } = await supabase
		.from('playlists')
		.select('*')
		.order('created_at', { ascending: false });

	if (error) return json({ error: error.message }, { status: 500 });
	return json(data);
}

export const POST: RequestHandler = async ({ request }) => {
	const { name, description } = await request.json();

	const { data, error } = await supabase
		.from('playlists')
		.insert([{ name, description, songs: [] }])
		.select()
		.single();

	if (error) return json({ error: error.message }, { status: 500 });
	return json(data);
};
