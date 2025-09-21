<script lang="ts">
	import { authStore } from '$lib/stores/auth.store';

	import Loading from '$lib/icons/Loading.svelte';

	const auth = $derived($authStore);
</script>

<header class="absolute top-0 z-10 w-full px-4 py-4 sm:px-6">
	<nav class="mx-auto flex max-w-7xl items-center justify-between">
		<a href="/" class="text-xl font-bold text-slate-200 transition-colors hover:text-white">
			Shortn
		</a>

		<!-- Auth Navigation -->
		<div class="flex items-center gap-3 sm:gap-4">
			{#if auth.isAuthenticated && auth.user}
				<span class="hidden text-sm text-slate-300 sm:block">
					Welcome, {auth.user.fullName}
				</span>
				<a
					href="/web/dashboard"
					class="duration-230 rounded-lg border border-slate-600/60 bg-slate-700/40 px-3 py-2 text-sm font-medium text-slate-300 backdrop-blur-lg transition-all hover:bg-slate-600/40 hover:text-slate-200 sm:px-4 sm:py-2"
				>
					Dashboard
				</a>
				<button
					onclick={() => authStore.logout()}
					disabled={auth.loading}
					class="duration-230 cursor-pointer rounded-lg bg-gradient-to-r from-slate-500/80 to-slate-600/80 px-3 py-2 text-sm font-semibold text-slate-100 backdrop-blur-lg transition-all hover:from-slate-400 hover:to-slate-600 disabled:opacity-50 sm:px-4 sm:py-2"
				>
					Sign Out
				</button>
			{:else if auth.loading}
				<Loading class="h-8 w-8" />
			{:else}
				<a
					href="/web/login"
					class="duration-230 rounded-lg border border-slate-600/60 bg-slate-700/40 px-3 py-2 text-sm font-medium text-slate-300 backdrop-blur-lg transition-all hover:bg-slate-600/40 hover:text-slate-200 sm:px-4 sm:py-2"
				>
					Sign In
				</a>
				<a
					href="/web/register"
					class="duration-230 rounded-lg bg-gradient-to-r from-slate-400/80 to-slate-600/80 px-3 py-2 text-sm font-semibold text-slate-100 backdrop-blur-lg transition-all hover:from-slate-400 hover:to-slate-600 sm:px-4 sm:py-2"
				>
					Sign Up
				</a>
			{/if}
		</div>
	</nav>
</header>
