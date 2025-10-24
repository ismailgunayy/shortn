<script lang="ts">
	import { authStore } from "$lib/stores/auth.store";

	import Loading from "$lib/icons/loading.icon.svelte";
	import ChevronDown from "$lib/icons/chevron-down.icon.svelte";
	import { page } from "$app/state";
	import { config } from "$lib/common/config";
	import { resolve } from "$app/paths";
	import { clientApi } from "$lib/services/api/api.client";

	const authState = $derived($authStore);

	const isHome = $derived(page.url.pathname === "/");

	let dropdownOpen = $state(false);

	function toggleDropdown() {
		dropdownOpen = !dropdownOpen;
	}

	function closeDropdown() {
		dropdownOpen = false;
	}

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
		<div class="flex items-end gap-4 sm:gap-8">
			<a
				href={resolve("/")}
				data-sveltekit-reload={isHome}
				class="text-heading-2 text-bright leading-9 font-bold hover:text-white"
			>
				Shortn
			</a>
			<a
				href={config.HTTP.DOCS_URL}
				class="text-button-small text-secondary hover:text-bright leading-7"
				target="_blank"
				rel="noopener noreferrer"
				>Developers
			</a>
		</div>

		<!-- Auth Navigation -->
		<div class="flex h-9 items-center gap-3">
			{#if authState.loading}
				<Loading class="h-8 w-8" />
			{:else if authState.user && !authState.loading}
				<div
					id="user-dropdown"
					class="relative"
				>
					<button
						type="button"
						onclick={toggleDropdown}
						class="text-button-small text-secondary hover:text-bright rounded-lgpx-3 flex items-center gap-2 py-2 font-medium backdrop-blur-lg transition-all sm:px-4 sm:py-2"
					>
						<span>{authState.user.fullName}</span>
						<ChevronDown class="h-4 w-4 transition-transform duration-200 {dropdownOpen ? 'rotate-180' : ''}" />
					</button>

					{#if dropdownOpen}
						<div
							class="absolute top-full right-0 mt-2 w-48 rounded-lg border border-slate-600/60 bg-slate-700/90 shadow-lg backdrop-blur-lg"
						>
							<div class="py-1">
								<a
									href={resolve("/web/dashboard")}
									onclick={closeDropdown}
									class="text-button-small text-secondary hover:text-bright block px-4 py-2 transition-colors hover:bg-slate-600/40"
								>
									Dashboard
								</a>
								<a
									href={resolve("/web/account")}
									onclick={closeDropdown}
									class="text-button-small text-secondary hover:text-bright block px-4 py-2 transition-colors hover:bg-slate-600/40"
								>
									Account
								</a>
								<hr class="my-1 border-slate-600/60" />
								<button
									type="button"
									onclick={async () => {
										closeDropdown();
										await clientApi.auth.logout();
									}}
									disabled={authState.loading}
									class="text-button-small text-secondary hover:text-bright block w-full px-4 py-2 text-left transition-colors hover:bg-slate-600/40 disabled:opacity-50"
								>
									Log Out
								</button>
							</div>
						</div>
					{/if}
				</div>
			{:else}
				<a
					href={resolve("/web/login")}
					class="text-button-small text-secondary hover:text-bright rounded-lg border border-slate-600/60 bg-slate-700/40 px-3 py-2 font-medium backdrop-blur-lg transition-all duration-230 hover:bg-slate-600/40 sm:px-4"
				>
					Log in
				</a>
				<a
					href={resolve("/web/register")}
					class="text-button-small text-button-color rounded-lg bg-gradient-to-r from-slate-500/80 to-slate-600/80 px-3 py-2 font-medium backdrop-blur-lg transition-all duration-230 hover:from-slate-400 hover:to-slate-600 sm:px-4"
				>
					Register
				</a>
			{/if}
		</div>
	</nav>
</header>
