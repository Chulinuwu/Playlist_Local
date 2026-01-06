import { json } from '@sveltejs/kit';
import { supabase } from '$lib/server/supabase';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const { data, error } = await supabase.from('playlists').select('*').eq('id', params.id).single();

	if (error) return json({ error: error.message }, { status: 404 });
	return json(data);
};

export const PUT: RequestHandler = async ({ params, request }) => {
	const updates = await request.json();

	const { data, error } = await supabase
		.from('playlists')
		.update(updates)
		.eq('id', params.id)
		.select()
		.single();

	if (error) return json({ error: error.message }, { status: 500 });
	return json(data);
};

export const DELETE: RequestHandler = async ({ params }) => {
	const { error } = await supabase.from('playlists').delete().eq('id', params.id);

	if (error) return json({ error: error.message }, { status: 500 });
	return json({ success: true });
};
