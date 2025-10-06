<script lang="ts">
	import { onMount } from "svelte";
	import { api } from "$lib/api/api.client";
	import Loading from "$lib/icons/Loading.svelte";
	import { default as ErrorIcon } from "$lib/icons/Error.svelte";
	import UrlsSection from "$lib/components/sections/UrlsSection.svelte";
	import ApiKeysSection from "$lib/components/sections/ApiKeysSection.svelte";
	import type { UrlItem, CustomUrlItem } from "$lib/api/services/url.service";
	import type { ApiKey } from "$lib/api/services/auth.service";

	// State
	let urls: UrlItem[] = $state([]);
	let customUrls: CustomUrlItem[] = $state([]);
	let apiKeys: ApiKey[] = $state([]);
	let loading = $state(true);
	let error = $state("");

	// Tab state
	let activeTab: "urls" | "apikeys" = $state("urls");

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		loading = true;
		error = "";

		try {
			const [urlsResponse, apiKeysResponse] = await Promise.all([api.url.getUserUrls(), api.auth.getApiKeys()]);

			if (urlsResponse.error) {
				throw new Error(urlsResponse.error.message);
			}

			if (apiKeysResponse.error) {
				throw new Error(apiKeysResponse.error.message);
			}

			if (urlsResponse.data) {
				urls = urlsResponse.data.urls;
				customUrls = urlsResponse.data.customUrls;
			}

			if (apiKeysResponse.data) {
				apiKeys = apiKeysResponse.data.apiKeys;
			}
		} catch (err) {
			error = err instanceof Error ? err.message : "Failed to load data";
		} finally {
			loading = false;
		}
	}

	function handleUrlDeleted(id: number, isCustom: boolean) {
		if (isCustom) {
			customUrls = customUrls.filter((url) => url.id !== id);
		} else {
			urls = urls.filter((url) => url.id !== id);
		}
	}

	function handleUrlUpdated(updatedUrl: CustomUrlItem) {
		customUrls = customUrls.map((url) => (url.id === updatedUrl.id ? updatedUrl : url));
	}

	function handleApiKeysUpdated(updatedApiKeys: ApiKey[]) {
		apiKeys = updatedApiKeys;
	}
</script>

<svelte:head>
	<title>Shortn | Dashboard</title>
	<meta
		name="description"
		content="Your Shortn dashboard"
	/>
</svelte:head>

<div>
	<!-- Header -->
	<div class="mx-auto max-w-6xl">
		<div class="mb-8 text-center">
			<h1
				class="text-heading-1 mb-3 bg-gradient-to-r from-slate-400 to-slate-200 bg-clip-text font-bold text-transparent"
			>
				Dashboard
			</h1>
			<p class="text-body text-secondary">Manage your URLs and API keys</p>
		</div>

		{#if loading}
			<div class="flex justify-center">
				<Loading class="h-8 w-8" />
			</div>
		{:else if error}
			<div class="text-error mx-auto max-w-md rounded-lg border border-red-800/50 bg-red-900/20 p-4 text-center">
				<ErrorIcon class="mx-auto mb-2 h-6 w-6" />
				{error}
				<button
					onclick={loadData}
					class="text-button-small mt-2 block w-full cursor-pointer rounded bg-red-800/30 px-3 py-1 hover:bg-red-800/50"
				>
					Retry
				</button>
			</div>
		{:else}
			<!-- Stats -->
			<div class="mb-8 grid gap-4 sm:grid-cols-3">
				<div class="rounded-xl border border-slate-600/60 bg-slate-700/40 p-4 backdrop-blur-lg">
					<div class="text-heading-2 text-bright font-bold">{customUrls.length}</div>
					<div class="text-body-small text-tertiary">
						Custom URL{customUrls.length !== 1 ? "s" : ""}
					</div>
				</div>
				<div class="rounded-xl border border-slate-600/60 bg-slate-700/40 p-4 backdrop-blur-lg">
					<div class="text-heading-2 text-bright font-bold">{urls.length}</div>
					<div class="text-body-small text-tertiary">
						Generated URL{urls.length !== 1 ? "s" : ""}
					</div>
				</div>
				<div class="rounded-xl border border-slate-600/60 bg-slate-700/40 p-4 backdrop-blur-lg">
					<div class="text-heading-2 text-bright font-bold">{apiKeys.length}</div>
					<div class="text-body-small text-tertiary">API Key{apiKeys.length !== 1 ? "s" : ""}</div>
				</div>
			</div>

			<!-- Tabs -->
			<div class="mb-6">
				<div class="flex space-x-1 rounded-lg border border-slate-600/60 bg-slate-700/40 p-1 backdrop-blur-lg">
					<button
						onclick={() => (activeTab = "urls")}
						class={`text-button-small flex-1 cursor-pointer rounded-md px-3 py-2 font-medium transition-all duration-200 ${
							activeTab === "urls"
								? "text-bright bg-slate-600/60 shadow-sm"
								: "text-secondary hover:text-bright hover:bg-slate-600/40"
						}`}
					>
						URLs ({urls.length + customUrls.length})
					</button>
					<button
						onclick={() => (activeTab = "apikeys")}
						class={`text-button-small flex-1 cursor-pointer rounded-md px-3 py-2 font-medium transition-all duration-200 ${
							activeTab === "apikeys"
								? "text-bright bg-slate-600/60 shadow-sm"
								: "text-secondary hover:text-bright hover:bg-slate-600/40"
						}`}
					>
						API Keys ({apiKeys.length})
					</button>
				</div>
			</div>

			<!-- Tab Content -->
			{#if activeTab === "urls"}
				<UrlsSection
					{urls}
					{customUrls}
					onUrlDeleted={handleUrlDeleted}
					onUrlUpdated={handleUrlUpdated}
				/>
			{:else if activeTab === "apikeys"}
				<ApiKeysSection
					{apiKeys}
					onApiKeysUpdated={handleApiKeysUpdated}
				/>
			{/if}
		{/if}
	</div>
</div>
