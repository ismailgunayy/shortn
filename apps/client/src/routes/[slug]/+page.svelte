<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let countdown = 5;
	let intervalId: ReturnType<typeof setInterval>;

	onMount(() => {
		// This page should normally not be reached due to server-side redirect
		// But if it is, show a countdown and try to redirect client-side
		intervalId = setInterval(() => {
			countdown--;
			if (countdown <= 0) {
				clearInterval(intervalId);
				// Try to go back to home page
				window.location.href = '/';
			}
		}, 1000);

		return () => {
			if (intervalId) {
				clearInterval(intervalId);
			}
		};
	});
</script>

<svelte:head>
	<title>Redirecting... - Shortn</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4"
>
	<div
		class="w-full max-w-sm rounded-xl border border-slate-600/40 bg-slate-600/25 p-6 text-center shadow-2xl shadow-slate-900/20 backdrop-blur-3xl sm:max-w-md sm:p-8"
	>
		<div class="mb-4 sm:mb-6">
			<div
				class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-slate-500/30 bg-slate-600/40 backdrop-blur-lg sm:mb-4 sm:h-16 sm:w-16"
			>
				<svg
					class="h-6 w-6 animate-spin text-slate-300 sm:h-8 sm:w-8"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
					/>
				</svg>
			</div>
			<h1 class="mb-2 text-xl font-bold text-slate-200 sm:text-2xl">Processing Redirect</h1>
			<p class="text-sm text-slate-400 sm:text-base">We're resolving your short URL...</p>
		</div>

		<div class="mb-6 rounded-lg border border-slate-600/30 bg-slate-800/40 p-3 backdrop-blur-lg">
			<p class="text-sm text-slate-300">
				Short URL: <span class="font-mono text-slate-200">/{$page.params.slug}</span>
			</p>
		</div>

		<div class="space-y-4">
			<div class="text-sm text-slate-400">
				If you're not redirected automatically, you'll be taken to the home page in {countdown} seconds.
			</div>

			<a
				href="/"
				class="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-slate-600 to-slate-700 px-4 py-2 text-sm font-medium text-slate-100 backdrop-blur-lg transition-all hover:scale-[1.02] hover:from-slate-500 hover:to-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
					/>
				</svg>
				Go to Home
			</a>
		</div>
	</div>
</div>
