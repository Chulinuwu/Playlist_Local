
<script lang="ts">
    import { onMount } from 'svelte';
    import { Clock, Play, Plus, MoreHorizontal, ListMusic, Search, Pause } from 'lucide-svelte';
    import { currentSong, isPlaying, playlists, likedSongs, allSongs } from '$lib/store'; 
    import type { ClientSong } from '$lib/store';
    import Modal from '$lib/components/Modal.svelte';

    let songs: ClientSong[] = $state([]);
    let filteredSongs: ClientSong[] = $state([]);
    let searchQuery = $state('');
    let showPlaylistMenuFor: string | null = $state(null);
    let isCreateModalOpen = $state(false);
    let newPlaylistName = $state('');
    let pendingSongId: string | null = $state(null);
    
    async function loadSongs() {
        const res = await fetch('/api/songs');
        if (res.ok) {
            songs = await res.json();
            $allSongs = songs;
            filterSongs();
        }
    }

    function filterSongs() {
        if (!searchQuery) {
            filteredSongs = songs;
        } else {
            const lowerQ = searchQuery.toLowerCase();
            filteredSongs = songs.filter(s => s.title.toLowerCase().includes(lowerQ) || s.artist.toLowerCase().includes(lowerQ));
        }
    }

    function playSong(song: ClientSong) {
        $currentSong = song;
        $isPlaying = true;
    }

    function toggleLibraryPlay() {
        if ($currentSong && songs.some(s => s.id === $currentSong?.id)) {
            $isPlaying = !$isPlaying;
        } else if (songs.length > 0) {
            playSong(songs[0]);
        }
    }

    async function toggleLike(songId: string) {
        const isLiked = $likedSongs.includes(songId);
        const method = isLiked ? 'DELETE' : 'POST';
        const res = await fetch('/api/liked-songs', {
            method,
            body: JSON.stringify({ song_id: songId }),
            headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
            if (isLiked) {
                $likedSongs = $likedSongs.filter(id => id !== songId);
            } else {
                $likedSongs = [...$likedSongs, songId];
            }
        }
    }

    function openCreateModal(songId: string) {
        pendingSongId = songId;
        newPlaylistName = 'My Playlist';
        isCreateModalOpen = true;
        showPlaylistMenuFor = null;
    }

    async function handleCreateAndAdd() {
        if (!newPlaylistName.trim() || !pendingSongId) return;
        const res = await fetch('/api/playlists', {
            method: 'POST',
            body: JSON.stringify({ name: newPlaylistName }),
            headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
            const newPlaylist = await res.json();
            $playlists = [newPlaylist, ...$playlists];
            await addToPlaylist(pendingSongId, newPlaylist.id);
            isCreateModalOpen = false;
            pendingSongId = null;
        }
    }

    async function addToPlaylist(songId: string, playlistId: string) {
        const p = $playlists.find(pl => pl.id === playlistId);
        if (!p) return;
        if (p.songs?.includes(songId)) {
            alert('Song already in playlist');
            return;
        }
        const newSongs = [...(p.songs || []), songId];
        const res = await fetch(`/api/playlists/${playlistId}`, {
            method: 'PUT',
            body: JSON.stringify({ songs: newSongs }),
            headers: {'Content-Type': 'application/json'}
        });
        if (res.ok) {
            const updated = await res.json();
            $playlists = $playlists.map(pl => pl.id === playlistId ? updated : pl);
            showPlaylistMenuFor = null;
        }
    }

    onMount(() => loadSongs());
</script>

<div class="flex flex-col min-h-full bg-black">
	<header class="relative px-8 pt-20 pb-8 flex items-end gap-6 bg-linear-to-b from-spotify-green/20 to-black">
		<div class="w-60 h-60 bg-zinc-800 shadow-2xl rounded-lg flex items-center justify-center overflow-hidden group relative">
			{#if songs.length > 0}
				<div class="absolute inset-0 bg-linear-to-br from-spotify-green/20 to-black/40"></div>
				<ListMusic size={100} class="text-zinc-600 relative z-10 group-hover:scale-110 transition-transform duration-500" />
			{:else}
				<ListMusic size={100} class="text-zinc-700" />
			{/if}
		</div>
		<div class="flex flex-col gap-3">
			<span class="text-xs font-black uppercase tracking-widest text-white/90">Public Playlist</span>
			<h1 class="text-8xl font-black tracking-tighter text-white drop-shadow-sm">Your Library</h1>
			<div class="flex items-center gap-2 text-sm font-bold text-white/80 mt-2">
				<span class="hover:underline cursor-pointer">Chulin</span>
				<span class="before:content-['•'] before:mr-2">
					{songs.length} {songs.length === 1 ? 'song' : 'songs'}
				</span>
			</div>
		</div>
	</header>

	<div class="px-8 py-6 flex items-center justify-between sticky top-0 z-10 bg-black mx-2 rounded-b-xl">
		<div class="flex items-center gap-8">
			<button 
				onclick={toggleLibraryPlay}
				class="w-14 h-14 bg-spotify-green rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-xl text-black"
				title="Play all"
			>
				{#if $isPlaying && $currentSong && songs.some(s => s.id === $currentSong?.id)}
					<Pause fill="currentColor" size={28} />
				{:else}
					<Play fill="currentColor" size={28} class="translate-x-0.5" />
				{/if}
			</button>
			
			<div class="relative group">
				<Search size={18} class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-white transition-colors" />
				<input
					type="text"
					placeholder="Search in library"
					bind:value={searchQuery}
					oninput={filterSongs}
					class="bg-zinc-800/50 hover:bg-zinc-700/50 focus:bg-zinc-700 text-white pl-12 pr-4 py-3 rounded-full text-sm border-none focus:ring-1 focus:ring-white/20 w-80 outline-none transition-all placeholder:text-zinc-500"
				/>
			</div>
		</div>
	</div>

	<div class="px-8 pb-20">
		<table class="w-full text-left border-separate border-spacing-y-1">
			<thead>
				<tr class="text-zinc-400 text-xs uppercase tracking-widest font-black border-b border-white/10">
					<th class="pb-3 pl-4 w-12">#</th>
					<th class="pb-3 px-4">Title</th>
					<th class="pb-3 px-4">Artist</th>
					<th class="pb-3 px-4 text-right pr-12"><Clock size={16} class="inline" /></th>
				</tr>
			</thead>
			<tbody class="pt-4">
				{#each filteredSongs as song, i}
					<tr
						class="group hover:bg-white/10 transition-all duration-200 rounded-md cursor-default text-sm text-zinc-400 hover:text-white relative"
						ondblclick={() => playSong(song)}
					>
						<td class="w-12 py-3 pl-4 align-middle rounded-l-lg">
							<span class="group-hover:hidden text-zinc-500 font-medium">{i + 1}</span>
							<button
								onclick={() => playSong(song)}
								class="hidden group-hover:flex items-center justify-center text-white"
							>
								<Play size={14} fill="currentColor" />
							</button>
						</td>
						<td class="py-3 px-4 align-middle">
							<div class="flex items-center gap-3">
								<div class="w-10 h-10 bg-zinc-800 rounded flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
									<ListMusic size={16} class="text-zinc-600" />
								</div>
								<div class="flex flex-col">
									<span class={`text-base font-bold truncate max-w-[300px] ${$currentSong?.id === song.id ? 'text-spotify-green' : 'text-white'}`}>
										{song.title}
									</span>
								</div>
							</div>
						</td>
						<td class="py-3 px-4 align-middle font-medium group-hover:text-white/90">{song.artist}</td>
						<td class="py-3 px-4 align-middle text-right pr-6 font-medium group-hover:text-white/90">
							<div class="flex items-center justify-end gap-4">
								<button 
									onclick={() => toggleLike(song.id)}
									class="opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 active:scale-90"
								>
									{#if $likedSongs.includes(song.id)}
										<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#1db954" stroke="#1db954" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.505 4.045 3 5.5L12 21Z"/></svg>
									{:else}
										<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart text-zinc-500 hover:text-white"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.505 4.045 3 5.5L12 21Z"/></svg>
									{/if}
								</button>
								<span class="min-w-[40px]">3:00</span>
							</div>
						</td>
						
						<td class="py-3 pr-4 align-middle rounded-r-lg text-right relative">
							<button
								onclick={(e) => {
									e.stopPropagation();
									showPlaylistMenuFor = showPlaylistMenuFor === song.id ? null : song.id;
								}}
								class="text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all p-2 hover:bg-white/10 rounded-full"
							>
								<MoreHorizontal size={20} />
							</button>

							{#if showPlaylistMenuFor === song.id}
								<div class="absolute right-0 top-12 bg-zinc-900 rounded-lg shadow-2xl border border-white/10 p-1 z-50 w-56 py-2 glass animate-in fade-in zoom-in duration-200">
									<div class="px-4 py-2 text-[10px] font-black text-zinc-500 uppercase tracking-tighter border-b border-white/5 mb-1">Add to Playlist</div>
									
									<button
										onclick={(e) => {
											e.stopPropagation();
											openCreateModal(song.id);
										}}
										class="w-full text-left px-4 py-2 text-sm text-spotify-green hover:bg-white/10 rounded font-bold transition-colors flex items-center gap-2"
									>
										<Plus size={16} />
										Create new playlist
									</button>

									{#if $playlists.length > 0}
										<div class="my-1 border-t border-white/5"></div>
										{#each $playlists as playlist}
											<button
												onclick={(e) => {
													e.stopPropagation();
													addToPlaylist(song.id, playlist.id);
												}}
												class="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 rounded font-bold transition-colors"
											>
												{playlist.name}
											</button>
										{/each}
									{/if}
								</div>

								<button
									type="button"
									aria-label="Close menu"
									class="fixed inset-0 z-40 bg-transparent cursor-default outline-none"
									onclick={(e) => {
										e.stopPropagation();
										showPlaylistMenuFor = null;
									}}
								></button>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<Modal
	isOpen={isCreateModalOpen}
	title="Create Playlist"
	onclose={() => {
		isCreateModalOpen = false;
		pendingSongId = null;
	}}
>
	<form
		onsubmit={(e) => {
			e.preventDefault();
			handleCreateAndAdd();
		}}
		class="flex flex-col gap-6"
	>
		<div class="space-y-2">
			<label for="new-playlist-name" class="text-xs font-black uppercase tracking-widest text-zinc-500">
				Playlist Name
			</label>
			<input
				id="new-playlist-name"
				type="text"
				bind:value={newPlaylistName}
				placeholder="My Playlist"
				class="w-full rounded-lg bg-zinc-800 border-none p-4 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-spotify-green transition-all outline-none"
			/>
		</div>

		<div class="flex justify-end gap-3 mt-4">
			<button
				type="button"
				onclick={() => {
					isCreateModalOpen = false;
					pendingSongId = null;
				}}
				class="px-6 py-3 rounded-full font-bold text-white hover:scale-105 active:scale-95 transition"
			>
				Cancel
			</button>
			<button
				type="submit"
				class="px-8 py-3 rounded-full bg-spotify-green text-black font-bold hover:scale-105 active:scale-95 transition shadow-lg disabled:opacity-50"
				disabled={!newPlaylistName.trim()}
			>
				Create & Add
			</button>
		</div>
	</form>
</Modal>
