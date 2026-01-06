
<script lang="ts">
    import { onMount } from 'svelte';
    import { Clock, Play, MoreHorizontal, ListMusic, Search, Heart, Pause } from 'lucide-svelte';
    import { currentSong, isPlaying, playlists, likedSongs } from '$lib/store';
    import type { ClientSong } from '$lib/store';

    let songs: ClientSong[] = $state([]);
    let likedSongsList: ClientSong[] = $state([]);
    let showPlaylistMenuFor: string | null = $state(null);

    async function loadData() {
        const sRes = await fetch('/api/songs');
        if (sRes.ok) {
            songs = await sRes.json();
            updateLikedList();
        }
    }

    function updateLikedList() {
        likedSongsList = songs.filter(s => $likedSongs.includes(s.id));
    }

    function playSong(song: ClientSong) {
        $currentSong = song;
        $isPlaying = true;
    }

    function toggleLikedPlay() {
        if ($currentSong && $likedSongs.includes($currentSong.id)) {
            $isPlaying = !$isPlaying;
        } else if (likedSongsList.length > 0) {
            playSong(likedSongsList[0]);
        }
    }

    async function toggleLike(songId: string) {
        const res = await fetch('/api/liked-songs', {
            method: 'DELETE',
            body: JSON.stringify({ song_id: songId }),
            headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
            $likedSongs = $likedSongs.filter(id => id !== songId);
            updateLikedList();
        }
    }

    async function addToPlaylist(songId: string, playlistId: string) {
        const p = $playlists.find(pl => pl.id === playlistId);
        if (!p) return;
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

    onMount(() => loadData());
</script>

<div class="flex flex-col min-h-full bg-black">
    <header class="relative px-8 pt-20 pb-8 flex items-end gap-6 bg-linear-to-b from-indigo-700/40 to-black">
        <div class="w-60 h-60 bg-linear-to-br from-indigo-600 to-indigo-400 shadow-2xl rounded-lg flex items-center justify-center overflow-hidden">
            <Heart size={100} fill="white" class="text-white" />
        </div>
        <div class="flex flex-col gap-3">
            <span class="text-xs font-black uppercase tracking-widest text-white/90">Playlist</span>
            <h1 class="text-8xl font-black tracking-tighter text-white drop-shadow-sm">Liked Songs</h1>
            <div class="flex items-center gap-2 text-sm font-bold text-white/80 mt-2">
                <span>Chulin • {likedSongsList.length} songs</span>
            </div>
        </div>
    </header>

    <div class="px-8 py-6 sticky top-0 z-10 bg-black mx-2 rounded-b-xl">
        <button 
            onclick={toggleLikedPlay}
            class="w-14 h-14 bg-spotify-green rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-xl text-black"
        >
            {#if $isPlaying && $currentSong && $likedSongs.includes($currentSong.id)}
                <Pause fill="currentColor" size={28} />
            {:else}
                <Play fill="currentColor" size={28} class="translate-x-0.5" />
            {/if}
        </button>
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
                {#each likedSongsList as song, i}
                    <tr class="group hover:bg-white/10 transition-all rounded-md cursor-default text-sm text-zinc-400 hover:text-white relative">
                        <td class="w-12 py-3 pl-4 align-middle rounded-l-lg">
                            <span class="group-hover:hidden text-zinc-500 font-medium">{i + 1}</span>
                            <button onclick={() => playSong(song)} class="hidden group-hover:flex items-center justify-center text-white">
                                <Play size={14} fill="currentColor" />
                            </button>
                        </td>
                        <td class="py-3 px-4 align-middle">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-zinc-800 rounded flex items-center justify-center">
                                    <ListMusic size={16} class="text-zinc-600" />
                                </div>
                                <span class={`text-base font-bold truncate ${$currentSong?.id === song.id ? 'text-spotify-green' : 'text-white'}`}>
                                    {song.title}
                                </span>
                            </div>
                        </td>
                        <td class="py-3 px-4 align-middle font-medium">{song.artist}</td>
                        <td class="py-3 px-4 align-middle text-right pr-6">
                            <div class="flex items-center justify-end gap-4">
                                <button onclick={() => toggleLike(song.id)} class="text-spotify-green">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.505 4.045 3 5.5L12 21Z"/></svg>
                                </button>
                                <span>3:00</span>
                            </div>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>
