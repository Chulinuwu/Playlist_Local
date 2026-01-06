import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { RequestHandler } from './$types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..', '..', '..');
const DOWNLOADS_DIR = path.join(PROJECT_ROOT, 'downloads');

export const GET: RequestHandler = async ({ params }) => {
	const filename = params.filename;
	const filePath = path.join(DOWNLOADS_DIR, filename);

	if (!fs.existsSync(filePath)) {
		return new Response('Not found', { status: 404 });
	}

	const stat = fs.statSync(filePath);

	// Read file as buffer instead of streaming to avoid controller issues
	const fileBuffer = fs.readFileSync(filePath);

	// Determine content type based on extension
	const ext = path.extname(filename).toLowerCase();
	let contentType = 'audio/mpeg';
	if (ext === '.webm') {
		contentType = 'audio/webm';
	} else if (ext === '.ogg') {
		contentType = 'audio/ogg';
	} else if (ext === '.wav') {
		contentType = 'audio/wav';
	}

	return new Response(fileBuffer, {
		headers: {
			'Content-Type': contentType,
			'Content-Length': stat.size.toString(),
			'Accept-Ranges': 'bytes',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
