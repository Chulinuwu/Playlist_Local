
<script lang="ts">
    import { currentSong, isPlaying, volume, queue, allSongs, isShuffle, repeatMode } from '$lib/store';
    import { Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat, ListMusic, Heart } from 'lucide-svelte';

    let audio: HTMLAudioElement | undefined = $state();
    let currentTime = $state(0);
    let duration = $state(0);
    let volumeValue = $state(1);

    $effect(() => {
        if (audio) {
            audio.volume = volumeValue;
            volume.set(volumeValue);
        }
    });

    $effect(() => {
        if (audio) {
           if ($isPlaying) {
               audio.play().catch(() => {});
           } else {
               audio.pause();
           }
        }
    });

    // When song changes
    $effect(() => {
        const _ = $currentSong; // Dependency
        if ($currentSong && audio) {
              setTimeout(() => {
                  if (audio) audio.play().catch(() => {});
              }, 100);
        }
    });

    function togglePlay() {
        isPlaying.update(n => !n);
    }

    function onTimeUpdate() {
        if (audio) currentTime = audio.currentTime;
    }

    function onMetadata() {
        if (audio) duration = audio.duration;
    }

    function nextSong() {
        if ($allSongs.length === 0) return;
        
        let nextIndex = 0;
        if ($currentSong) {
            const currentIndex = $allSongs.findIndex(s => s.id === $currentSong?.id);
            if ($isShuffle) {
                nextIndex = Math.floor(Math.random() * $allSongs.length);
            } else {
                nextIndex = (currentIndex + 1) % $allSongs.length;
            }
        }
        $currentSong = $allSongs[nextIndex];
        $isPlaying = true;
    }

    function previousSong() {
        if ($allSongs.length === 0) return;
        
        if (currentTime > 3 && audio) {
            audio.currentTime = 0;
            return;
        }

        let prevIndex = 0;
        if ($currentSong) {
            const currentIndex = $allSongs.findIndex(s => s.id === $currentSong?.id);
            if ($isShuffle) {
                prevIndex = Math.floor(Math.random() * $allSongs.length);
            } else {
                prevIndex = (currentIndex - 1 + $allSongs.length) % $allSongs.length;
            }
        }
        $currentSong = $allSongs[prevIndex];
        $isPlaying = true;
    }

    function toggleShuffle() {
        $isShuffle = !$isShuffle;
    }

    function toggleRepeat() {
        const modes: ('off' | 'all' | 'one')[] = ['off', 'all', 'one'];
        const currentIdx = modes.indexOf($repeatMode);
        $repeatMode = modes[(currentIdx + 1) % modes.length];
    }

    function onEnded() {
        if ($repeatMode === 'one') {
            if (audio) {
                audio.currentTime = 0;
                audio.play();
            }
        } else if ($repeatMode === 'all') {
            nextSong();
        } else {
            const currentIndex = $allSongs.findIndex(s => s.id === $currentSong?.id);
            if (currentIndex < $allSongs.length - 1 || $isShuffle) {
                nextSong();
            } else {
                $isPlaying = false;
            }
        }
    }

    function formatTime(seconds: number) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    function setTime(e: Event) {
        if (!audio) return;
        const target = e.target as HTMLInputElement;
        audio.currentTime = parseFloat(target.value);
    }
</script>

<div class="flex items-center justify-between w-full h-full max-w-[100vw] px-2">
    <!-- Now Playing Info -->
    <div class="flex items-center gap-4 min-w-[180px] w-[30%]">
        {#if $currentSong}
            <div class="w-14 h-14 bg-zinc-800 flex items-center justify-center rounded-md shadow-2xl relative group overflow-hidden">
                <div class="absolute inset-0 bg-spotify-green/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <ListMusic size={24} class="text-zinc-500 group-hover:text-spotify-green transition-colors" />
            </div>
            <div class="flex flex-col overflow-hidden">
                <div class="text-[14px] font-bold text-white hover:underline cursor-pointer truncate">
                    {$currentSong.title}
                </div>
                <div class="text-[11px] font-bold text-zinc-400 hover:text-white hover:underline cursor-pointer truncate">
                    {$currentSong.artist}
                </div>
            </div>
        {/if}
    </div>

    <!-- Controls -->
    <div class="flex flex-col items-center gap-2 flex-1 max-w-[600px]">
        <div class="flex items-center gap-6">
            <button 
                onclick={toggleShuffle}
                class="transition-all transform active:scale-95 {$isShuffle ? 'text-spotify-green' : 'text-zinc-400 hover:text-white'}"
            >
                <Shuffle size={16} />
            </button>
            <button 
                onclick={previousSong}
                class="text-zinc-400 hover:text-white transition-all transform active:scale-90"
            >
                <SkipBack size={20} fill="currentColor" />
            </button>
            <button 
                onclick={togglePlay}
                class="bg-white rounded-full p-2.5 text-black hover:scale-105 active:scale-95 transition shadow-lg flex items-center justify-center"
            >
                {#if $isPlaying}
                    <Pause size={20} fill="currentColor" />
                {:else}
                    <Play size={20} fill="currentColor" class="pl-0.5" />
                {/if}
            </button>
            <button 
                onclick={nextSong}
                class="text-zinc-400 hover:text-white transition-all transform active:scale-90"
            >
                <SkipForward size={20} fill="currentColor" />
            </button>
            <button 
                onclick={toggleRepeat}
                class="transition-all transform active:scale-95 {$repeatMode !== 'off' ? 'text-spotify-green' : 'text-zinc-400 hover:text-white'} relative"
            >
                <Repeat size={16} />
                {#if $repeatMode === 'one'}
                    <span class="absolute -top-1 -right-1 text-[8px] font-black bg-spotify-green text-black rounded-full w-3 h-3 flex items-center justify-center">1</span>
                {/if}
            </button>
        </div>

        <div class="w-full flex items-center gap-2 px-4">
            <span class="text-[11px] font-bold text-zinc-400 min-w-[40px] text-right">{formatTime(currentTime)}</span>
            <div class="flex-1 group relative flex items-center">
                <input 
                    type="range" 
                    min="0" 
                    max={duration || 100} 
                    value={currentTime} 
                    oninput={setTime}
                    class="w-full h-1 bg-zinc-600 rounded-full appearance-none cursor-pointer outline-none transition-all group-hover:h-1.5"
                    style="background-image: linear-gradient(to right, #1db954 {(currentTime / (duration || 1)) * 100}%, #4b5563 {(currentTime / (duration || 1)) * 100}%);"
                />
            </div>
            <span class="text-[11px] font-bold text-zinc-400 min-w-[40px]">{formatTime(duration)}</span>
        </div>
    </div>

    <!-- Volume -->
    <div class="flex items-center justify-end gap-3 w-[30%] min-w-[150px]">
        <Volume2 size={20} class="text-zinc-400 hover:text-white transition-colors cursor-pointer" />
        <div class="w-24 group flex items-center">
             <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                bind:value={volumeValue}
                class="w-full h-1 bg-zinc-600 rounded-full appearance-none cursor-pointer outline-none transition-all group-hover:h-1.5"
                style="background-image: linear-gradient(to right, #1db954 {volumeValue * 100}%, #4b5563 {volumeValue * 100}%);"
            />
        </div>
    </div>

    {#if $currentSong}
        <audio 
            bind:this={audio}
            src={`/api/audio/${$currentSong.id}`}
            ontimeupdate={onTimeUpdate}
            onloadedmetadata={onMetadata}
            onended={onEnded}
        ></audio>
    {/if}
</div>
