<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import GitHub from '$lib/icons/GitHub.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header></header>

<main class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800/90 to-slate-900">
	{@render children?.()}
</main>
<footer class="absolute bottom-0 mx-auto mb-2 flex w-full justify-center">
	<a href="https://github.com/ismailgunayy/shortn" target="_blank">
		<GitHub
			class="size-12 rounded-lg p-2 text-white transition hover:bg-white hover:text-slate-800"
		/>
	</a>
</footer>
