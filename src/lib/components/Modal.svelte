
<script lang="ts">
	import { X } from 'lucide-svelte';
	import { fade, scale } from 'svelte/transition';

	let { isOpen = false, title = '', onclose, children } = $props();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && isOpen) {
			onclose();
		}
	}
	function handleBackdropKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			onclose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
		transition:fade={{ duration: 200 }}
		onclick={onclose}
		onkeydown={handleBackdropKeydown}
		aria-hidden="true"
		tabindex="-1"
	>
		<div
			class="relative w-full max-w-md overflow-hidden rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl"
			transition:scale={{ duration: 200, start: 0.95 }}
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			aria-modal="true"
			role="dialog"
			tabindex="0"
		>
			<div class="flex items-center justify-between p-6 pb-2">
				<h2 class="text-2xl font-black tracking-tight text-white">{title}</h2>
				<button
					onclick={onclose}
					class="rounded-full p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
				>
					<X size={20} />
				</button>
			</div>

			<div class="p-6">
				{@render children()}
			</div>
		</div>
	</div>
{/if}
