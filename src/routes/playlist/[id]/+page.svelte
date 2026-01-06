
<script lang="ts">
    import { onMount } from 'svelte';
    import { page as pageState } from '$app/state';
    import { Clock, Play, Trash2, ListMusic, Pause } from 'lucide-svelte';
    import { currentSong, isPlaying } from '$lib/store';
    import type { ClientSong } from '$lib/store';

    let playlistId = $derived(pageState.params.id);
    let playlist: any = $state(null);
    let allSongs: ClientSong[] = [];
    let playlistSongs: ClientSong[] = $state([]);

    async function loadData() {
        if (!playlistId) return;
        const pRes = await fetch(`/api/playlists/${playlistId}`);
        if(pRes.ok) playlist = await pRes.json();
        const sRes = await fetch('/api/songs');
        if(sRes.ok) allSongs = await sRes.json();
        updatePlaylistSongs();
    }

    function updatePlaylistSongs() {
        if (!playlist || !allSongs.length) return;
        playlistSongs = playlist.songs.map((id: string) => allSongs.find(s => s.id === id)).filter(Boolean);
    }

    async function removeSong(songId: string) {
        if (!confirm('Remove this song from playlist?')) return;
        const newSongs = playlist.songs.filter((id: string) => id !== songId);
        const res = await fetch(`/api/playlists/${playlistId}`, {
            method: 'PUT',
            body: JSON.stringify({ songs: newSongs }),
            headers: {'Content-Type': 'application/json'}
        });
        if (res.ok) {
            playlist = await res.json();
            updatePlaylistSongs();
        }
    }

    function playSong(song: ClientSong) {
        $currentSong = song;
        $isPlaying = true;
    }

    function togglePlaylistPlay() {
        if ($currentSong && playlistSongs.some(s => s.id === $currentSong?.id)) {
            $isPlaying = !$isPlaying;
        } else if (playlistSongs.length > 0) {
            playSong(playlistSongs[0]);
        }
    }

    $effect(() => {
        loadData();
    });
</script>

{#if playlist}
	<div class="flex flex-col min-h-full bg-black">
		<header class="relative px-8 pt-20 pb-8 flex items-end gap-6 bg-linear-to-b from-indigo-900/20 to-black">
			<div class="w-60 h-60 bg-zinc-800 shadow-2xl rounded-lg flex items-center justify-center overflow-hidden group relative">
				<div class="absolute inset-0 bg-linear-to-br from-indigo-500/10 to-transparent"></div>
				<ListMusic size={100} class="text-zinc-600 relative z-10 group-hover:scale-110 transition-transform duration-500" />
			</div>
			<div class="flex flex-col gap-3">
				<span class="text-xs font-black uppercase tracking-widest text-white/90">Playlist</span>
				<h1 class="text-8xl font-black tracking-tighter text-white drop-shadow-sm">{playlist.name}</h1>
				<div class="flex items-center gap-2 text-sm font-bold text-white/80 mt-2">
					<span class="hover:underline cursor-pointer">Chulin</span>
					<span class="before:content-['•'] before:mr-2">
						{#if playlist.description}
							{playlist.description} •
						{/if}
						{playlistSongs.length} {playlistSongs.length === 1 ? 'song' : 'songs'}
					</span>
				</div>
			</div>
		</header>

		<div class="px-8 py-6 flex items-center justify-between sticky top-0 z-10 bg-black mx-2 rounded-b-xl">
			<div class="flex items-center gap-8">
				<button 
					onclick={togglePlaylistPlay}
					class="w-14 h-14 bg-spotify-green rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-xl text-black"
					title="Play playlist"
				>
					{#if $isPlaying && $currentSong && playlistSongs.some(s => s.id === $currentSong?.id)}
						<Pause fill="currentColor" size={28} />
					{:else}
						<Play fill="currentColor" size={28} class="translate-x-0.5" />
					{/if}
				</button>
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
					{#each playlistSongs as song, i}
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
								3:00
							</td>
							
							<td class="py-3 pr-4 align-middle rounded-r-lg text-right relative">
								<button
									onclick={() => removeSong(song.id)}
									class="text-zinc-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-2 hover:bg-white/10 rounded-full"
									title="Remove from playlist"
								>
									<Trash2 size={20} />
								</button>
							</td>
						</tr>
					{/each}
					{#if playlistSongs.length === 0}
						<tr>
							<td colspan="5" class="py-20 text-center">
								<div class="flex flex-col items-center gap-4">
									<ListMusic size={48} class="text-zinc-700" />
									<p class="text-zinc-500 font-bold">This playlist is empty.</p>
									<a href="/" class="bg-white text-black px-8 py-3 rounded-full font-black text-xs hover:scale-105 transition">Find some songs</a>
								</div>
							</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>
	</div>
{/if}
