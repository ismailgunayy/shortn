<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { initializeApp } from '$lib/common/init';

	let { children } = $props();
	let initError = $state<string | null>(null);

	onMount(async () => {
		const result = await initializeApp();
		if (!result.success && result.error) {
			initError = result.error;
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if initError}
	<div class="flex min-h-screen items-center justify-center bg-red-950/40 p-4">
		<div
			class="max-w-sm rounded-xl border border-red-800/30 bg-red-900/20 p-6 text-center backdrop-blur-xl sm:max-w-md"
		>
			<h1 class="mb-4 text-xl font-bold text-red-400 sm:text-2xl">Configuration Error</h1>
			<p class="mb-4 text-sm text-red-300 sm:text-base">{initError}</p>
			<p class="text-xs text-red-400 sm:text-sm">
				Please check your environment configuration and try again.
			</p>
		</div>
	</div>
{:else}
	<main class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
		{@render children?.()}
	</main>
{/if}
