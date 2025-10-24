<script lang="ts">
	import favicon from "$lib/assets/favicon.svg";
	import Footer from "$lib/components/layouts/footer.layout.svelte";
	import Header from "$lib/components/layouts/header.layout.svelte";
	import { authStore } from "$lib/stores/auth.store";
	import { onMount } from "svelte";
	import { Toaster } from "svelte-french-toast";
	import "../app.css";

	const { children } = $props();

	onMount(async () => {
		authStore.setAuthenticatedFromTokens();
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

	<main class="flex-1 px-4 pt-8 pb-16">
		{@render children?.()}
	</main>

	<Footer />

	<Toaster />
</div>
