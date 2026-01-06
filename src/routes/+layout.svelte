
<script lang="ts">
	import './layout.css';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { Home, Library, PlusSquare, Search, ListMusic } from 'lucide-svelte';
	import { playlists, likedSongs } from '$lib/store';
	import Player from '$lib/components/Player.svelte';
	import Modal from '$lib/components/Modal.svelte';

	let { children } = $props();
	let isCreateModalOpen = $state(false);
	let newPlaylistName = $state('');

	async function loadPlaylists() {
		const res = await fetch('/api/playlists');
		if (res.ok) {
			$playlists = await res.json();
		}
	}

	async function loadLikedSongs() {
		const res = await fetch('/api/liked-songs');
		if (res.ok) {
			$likedSongs = await res.json();
		}
	}

	function openCreateModal() {
		newPlaylistName = 'My Playlist';
		isCreateModalOpen = true;
	}

	async function handleCreatePlaylist(e?: Event) {
		if (e) e.preventDefault();
		if (!newPlaylistName.trim()) return;

		const res = await fetch('/api/playlists', {
			method: 'POST',
			body: JSON.stringify({ name: newPlaylistName }),
			headers: { 'Content-Type': 'application/json' }
		});

		if (res.ok) {
			isCreateModalOpen = false;
			newPlaylistName = '';
			loadPlaylists();
		}
	}

	onMount(() => {
		loadPlaylists();
		loadLikedSongs();
	});
</script>

<div class="h-screen w-screen flex flex-col bg-black text-white overflow-hidden selection:bg-spotify-green/30">
	<div class="flex-1 flex overflow-hidden p-2 gap-2">
		<aside class="w-72 flex flex-col gap-2">
			<nav class="bg-zinc-900/20 rounded-xl p-4 flex flex-col gap-4 border border-white/5">
				<a
					href="/"
					class="group flex items-center gap-4 px-2 py-1 font-bold text-zinc-400 transition-all duration-300 hover:text-white"
				>
					<Home size={24} class="transition-transform group-hover:scale-110" />
					Home
				</a>
				<a
					href="/"
					class="group flex items-center gap-4 px-2 py-1 font-bold text-zinc-400 transition-all duration-300 hover:text-white"
				>
					<Search size={24} class="transition-transform group-hover:scale-110" />
					Search
				</a>
			</nav>

			<div class="flex flex-1 flex-col overflow-hidden rounded-xl bg-zinc-900/20 border border-white/5">
				<div class="flex items-center justify-between p-4 shadow-md">
					<div class="flex items-center gap-3 px-2 font-bold text-zinc-400">
						<Library size={24} />
						Your Library
					</div>
					<button
						onclick={openCreateModal}
						class="rounded-full p-2 text-zinc-400 transition-all hover:bg-white/10 hover:text-white"
						title="Create playlist"
					>
						<PlusSquare size={20} />
					</button>
				</div>

				<div class="flex-1 space-y-1 overflow-y-auto px-2 pb-4 pt-2">
					<a
						href="/liked-songs"
						class="group flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-white/5"
					>
						<div
							class="rounded bg-linear-to-br from-indigo-600 to-indigo-400 p-2 shadow-lg transition-transform group-hover:scale-105"
						>
							<ListMusic size={20} class="text-white" />
						</div>
						<div class="flex flex-col">
							<span class="text-sm font-bold">Liked Songs</span>
							<span class="text-xs text-zinc-400">Playlist • {$likedSongs.length} songs</span>
						</div>
					</a>

					<div class="mx-2 my-2 h-[1px] bg-white/5"></div>

					{#each $playlists as playlist}
						<a
							href={`/playlist/${playlist.id}`}
							class="group flex items-center gap-3 rounded-lg p-3 transition-all hover:bg-white/5"
						>
							<div
								class="flex h-12 w-12 items-center justify-center overflow-hidden rounded bg-zinc-800 shadow-lg transition-transform group-hover:scale-105"
							>
								<ListMusic size={20} class="text-zinc-500" />
							</div>
							<div class="flex flex-col overflow-hidden">
								<span class="truncate text-sm font-bold">{playlist.name}</span>
								<span class="text-xs text-zinc-400">Playlist • {playlist.songs?.length || 0} songs</span>
							</div>
						</a>
					{/each}
				</div>
			</div>
		</aside>

		<main class="relative flex flex-1 flex-col overflow-hidden rounded-xl bg-black shadow-2xl">
			<div class="custom-scrollbar relative flex-1 overflow-y-auto">
				{@render children()}
			</div>
		</main>
	</div>

	<footer class="h-24 bg-black px-4 flex items-center justify-between z-20">
		<Player />
	</footer>
</div>

<Modal
	isOpen={isCreateModalOpen}
	title="Create Playlist"
	onclose={() => (isCreateModalOpen = false)}
>
	<form onsubmit={handleCreatePlaylist} class="flex flex-col gap-6">
		<div class="space-y-2">
			<label for="playlist-name" class="text-xs font-black uppercase tracking-widest text-zinc-500">
				Playlist Name
			</label>
			<input
				id="playlist-name"
				type="text"
				bind:value={newPlaylistName}
				placeholder="My Playlist"
				class="w-full rounded-lg bg-zinc-800 border-none p-4 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-spotify-green transition-all"
			/>
		</div>

		<div class="flex justify-end gap-3 mt-4">
			<button
				type="button"
				onclick={() => (isCreateModalOpen = false)}
				class="px-6 py-3 rounded-full font-bold text-white hover:scale-105 active:scale-95 transition"
			>
				Cancel
			</button>
			<button
				type="submit"
				class="px-8 py-3 rounded-full bg-spotify-green text-black font-bold hover:scale-105 active:scale-95 transition shadow-lg disabled:opacity-50"
				disabled={!newPlaylistName.trim()}
			>
				Create
			</button>
		</div>
	</form>
</Modal>
