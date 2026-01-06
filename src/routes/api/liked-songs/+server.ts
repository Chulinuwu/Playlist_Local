import { json } from '@sveltejs/kit';
import { supabase } from '$lib/server/supabase';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const { data, error } = await supabase.from('liked_songs').select('song_id');

	if (error) return json({ error: error.message }, { status: 500 });
	return json(data.map((item) => item.song_id));
};

export const POST: RequestHandler = async ({ request }) => {
	const { song_id } = await request.json();

	const { data, error } = await supabase
		.from('liked_songs')
		.upsert([{ song_id }])
		.select()
		.single();

	if (error) return json({ error: error.message }, { status: 500 });
	return json(data);
};

export const DELETE: RequestHandler = async ({ request }) => {
	const { song_id } = await request.json();

	const { error } = await supabase.from('liked_songs').delete().eq('song_id', song_id);

	if (error) return json({ error: error.message }, { status: 500 });
	return json({ success: true });
};
