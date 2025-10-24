<script lang="ts">
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
	<!-- Favicon and App Icons -->
	<link
		rel="icon"
		type="image/png"
		href="/favicon/favicon-96x96.png"
		sizes="96x96"
	/>
	<link
		rel="icon"
		type="image/svg+xml"
		href="/favicon/favicon.svg"
	/>
	<link
		rel="shortcut icon"
		href="/favicon/favicon.ico"
	/>
	<link
		rel="apple-touch-icon"
		sizes="180x180"
		href="/favicon/apple-touch-icon.png"
	/>
	<meta
		name="apple-mobile-web-app-title"
		content="Shortn"
	/>
	<link
		rel="manifest"
		href="/favicon/site.webmanifest"
	/>

	<link
		rel="dns-prefetch"
		href="https://docs.shortn.top"
	/>

	<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "Organization",
			"name": "Shortn",
			"url": "https://shortn.top",
			"logo": "https://shortn.top/favicon/favicon.svg",
			"description": "Free URL shortener service for creating short, shareable links instantly",
			"foundingDate": "2024",
			"contactPoint": {
				"@type": "ContactPoint",
				"contactType": "technical support",
				"url": "https://github.com/ismailgunayy/shortn/issues"
			},
			"sameAs": ["https://github.com/ismailgunayy/shortn"]
		}
	</script>
</svelte:head>

<div class="flex min-h-screen flex-col bg-gradient-to-br from-slate-900 via-slate-800/90 to-slate-900">
	<Header />

	<main class="flex-1 px-4 pt-8 pb-16">
		{@render children?.()}
	</main>

	<Footer />

	<Toaster />
</div>
