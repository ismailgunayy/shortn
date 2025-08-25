<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { apiService } from '$lib/services/api';

	let { children } = $props();

	onMount(async () => {
		await apiService.authenticate();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<main class=" 	min-h-screen bg-gradient-to-br from-slate-900 via-slate-800/90 to-slate-900">
	{@render children?.()}
</main>
