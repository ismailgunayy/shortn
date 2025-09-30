<script lang="ts">
	import { authStore } from '$lib/stores/auth.store';

	import Loading from '$lib/icons/Loading.svelte';
	import { page } from '$app/state';

	const auth = $derived($authStore);

	const isHome = $derived(page.url.pathname === '/');
</script>

<header class="z-10 w-full px-4 py-4 sm:px-6">
	<nav class="mx-auto flex max-w-7xl items-center justify-between">
		<a
			href="/"
			data-sveltekit-reload={isHome}
			class="text-heading-2 text-bright font-bold transition-colors hover:text-white"
		>
			Shortn
		</a>

		<!-- Auth Navigation -->
		<div class="flex items-center gap-3 sm:gap-4">
			{#if auth.isAuthenticated && auth.user}
				<span class="text-body-small text-secondary hidden sm:block">
					Welcome, {auth.user.fullName}
				</span>
				<a
					href="/web/dashboard"
					class="text-button-small duration-230 text-secondary hover:text-bright rounded-lg border border-slate-600/60 bg-slate-700/40 px-3 py-2 font-medium backdrop-blur-lg transition-all hover:bg-slate-600/40 sm:px-4 sm:py-2"
				>
					Dashboard
				</a>
				<button
					onclick={() => authStore.logout()}
					disabled={auth.loading}
					class="text-button-small duration-230 text-button-color cursor-pointer rounded-lg bg-gradient-to-r from-slate-500/80 to-slate-600/80 px-3 py-2 font-semibold backdrop-blur-lg transition-all hover:from-slate-400 hover:to-slate-600 disabled:opacity-50 sm:px-4 sm:py-2"
				>
					Sign Out
				</button>
			{:else if auth.loading}
				<Loading class="h-8 w-8" />
			{:else}
				<a
					href="/web/login"
					class="text-button-small duration-230 text-secondary hover:text-bright rounded-lg border border-slate-600/60 bg-slate-700/40 px-3 py-2 font-medium backdrop-blur-lg transition-all hover:bg-slate-600/40 sm:px-4 sm:py-2"
				>
					Sign In
				</a>
				<a
					href="/web/register"
					class="text-button-small duration-230 text-button-color rounded-lg bg-gradient-to-r from-slate-500/80 to-slate-600/80 px-3 py-2 font-semibold backdrop-blur-lg transition-all hover:from-slate-400 hover:to-slate-600 sm:px-4 sm:py-2"
				>
					Sign Up
				</a>
			{/if}
		</div>
	</nav>
</header>
