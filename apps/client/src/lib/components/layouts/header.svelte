<script lang="ts">
	import { authStore } from "$lib/stores/auth.store";

	import Loading from "$lib/icons/loading.svelte";
	import ChevronDown from "$lib/icons/chevron-down.svelte";
	import { page } from "$app/state";
	import { config } from "$lib/common/config";

	const auth = $derived($authStore);

	const isHome = $derived(page.url.pathname === "/");

	let dropdownOpen = $state(false);

	$effect(() => {
		dropdownOpen = false;
	});

	function toggleDropdown() {
		dropdownOpen = !dropdownOpen;
	}

	function closeDropdown() {
		dropdownOpen = false;
	}

	// Close dropdown when clicking outside
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as Element;
		const dropdown = document.getElementById("user-dropdown");
		if (dropdown && !dropdown.contains(target)) {
			closeDropdown();
		}
	}
</script>

<svelte:window onclick={handleClickOutside} />

<header class="z-10 w-full px-4 py-4 sm:px-6">
	<nav class="mx-auto flex max-w-7xl items-center justify-between">
		<div class="flex items-end gap-8">
			<a
				href="/"
				data-sveltekit-reload={isHome}
				class="text-heading-2 text-bright font-bold hover:text-white"
			>
				Shortn
			</a>
			<a
				href={config.HTTP.DOCS_URL}
				class="text-button-small text-secondary hover:text-bright leading-6"
				target="_blank"
				>Developers
			</a>
		</div>

		<!-- Auth Navigation -->
		<div class="flex items-center gap-3 sm:gap-4">
			{#if auth.isAuthenticated && auth.user}
				<div
					id="user-dropdown"
					class="relative"
				>
					<button
						onclick={toggleDropdown}
						class="text-button-small text-secondary hover:text-bright rounded-lgpx-3 flex items-center gap-2 py-2 font-medium backdrop-blur-lg transition-all sm:px-4 sm:py-2"
					>
						<span>{auth.user.fullName}</span>
						<ChevronDown class="h-4 w-4 transition-transform duration-200 {dropdownOpen ? 'rotate-180' : ''}" />
					</button>

					{#if dropdownOpen}
						<div
							class="absolute right-0 top-full mt-2 w-48 rounded-lg border border-slate-600/60 bg-slate-700/90 shadow-lg backdrop-blur-lg"
						>
							<div class="py-1">
								<a
									href="/web/dashboard"
									onclick={closeDropdown}
									class="text-button-small text-secondary hover:text-bright block px-4 py-2 transition-colors hover:bg-slate-600/40"
								>
									Dashboard
								</a>
								<a
									href="/web/account"
									onclick={closeDropdown}
									class="text-button-small text-secondary hover:text-bright block px-4 py-2 transition-colors hover:bg-slate-600/40"
								>
									Account
								</a>
								<hr class="my-1 border-slate-600/60" />
								<button
									onclick={() => {
										closeDropdown();
										authStore.logout();
									}}
									disabled={auth.loading}
									class="text-button-small text-secondary hover:text-bright block w-full px-4 py-2 text-left transition-colors hover:bg-slate-600/40 disabled:opacity-50"
								>
									Log Out
								</button>
							</div>
						</div>
					{/if}
				</div>
			{:else if auth.loading}
				<Loading class="h-8 w-8" />
			{:else}
				<a
					href="/web/login"
					class="text-button-small duration-230 text-secondary hover:text-bright rounded-lg border border-slate-600/60 bg-slate-700/40 px-3 py-2 font-medium backdrop-blur-lg transition-all hover:bg-slate-600/40 sm:px-4 sm:py-2"
				>
					Log in
				</a>
				<a
					href="/web/register"
					class="text-button-small duration-230 text-button-color rounded-lg bg-gradient-to-r from-slate-500/80 to-slate-600/80 px-3 py-2 font-semibold backdrop-blur-lg transition-all hover:from-slate-400 hover:to-slate-600 sm:px-4 sm:py-2"
				>
					Register
				</a>
			{/if}
		</div>
	</nav>
</header>
