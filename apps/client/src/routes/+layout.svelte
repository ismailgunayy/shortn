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
	<div class="flex min-h-screen items-center justify-center bg-red-50 p-4 dark:bg-red-900/20">
		<div class="max-w-md text-center">
			<h1 class="mb-4 text-2xl font-bold text-red-600 dark:text-red-400">Configuration Error</h1>
			<p class="mb-4 text-red-700 dark:text-red-300">{initError}</p>
			<p class="text-sm text-red-600 dark:text-red-400">
				Please check your environment configuration and try again.
			</p>
		</div>
	</div>
{:else}
	<main
		class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800"
	>
		{@render children?.()}
	</main>
{/if}
