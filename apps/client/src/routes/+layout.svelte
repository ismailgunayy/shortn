<script lang="ts">
	import { onMount } from "svelte";
	import "../app.css";
	import favicon from "$lib/assets/favicon.svg";
	import Header from "$lib/components/Header.svelte";
	import { authStore } from "$lib/stores/auth.store";
	import Footer from "$lib/components/Footer.svelte";

	let { children } = $props();

	onMount(() => {
		authStore.checkStatus();
	});
</script>

<svelte:head>
	<link
		rel="icon"
		href={favicon}
	/>
</svelte:head>

<div class="flex min-h-screen flex-col bg-gradient-to-br from-slate-900 via-slate-800/90 to-slate-900">
	<Header />

	<main class="flex-1 px-4 pb-16 pt-20">
		{@render children?.()}
	</main>

	<Footer />
</div>
