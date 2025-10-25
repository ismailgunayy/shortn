<script lang="ts">
	import ApiKeysSection from "$lib/components/sections/api-keys.section.svelte";
	import UrlsSection from "$lib/components/sections/urls.section.svelte";

	let activeTab: "urls" | "apikeys" = $state("urls");
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

		<!-- Tabs -->
		<div class="mb-6">
			<div class="flex space-x-1 rounded-lg border border-slate-600/60 bg-slate-700/40 p-1 backdrop-blur-lg">
				<button
					type="button"
					onclick={() => (activeTab = "urls")}
					class={`text-button-small flex-1 rounded-md px-3 py-2 font-medium transition-all duration-200 ${
						activeTab === "urls"
							? "text-bright bg-slate-600/60 shadow-sm"
							: "text-secondary hover:text-bright hover:bg-slate-600/40"
					}`}
				>
					URLs
				</button>
				<button
					type="button"
					onclick={() => (activeTab = "apikeys")}
					class={`text-button-small flex-1 rounded-md px-3 py-2 font-medium transition-all duration-200 ${
						activeTab === "apikeys"
							? "text-bright bg-slate-600/60 shadow-sm"
							: "text-secondary hover:text-bright hover:bg-slate-600/40"
					}`}
				>
					API Keys
				</button>
			</div>
		</div>

		<!-- Tab Content -->
		{#if activeTab === "urls"}
			<UrlsSection />
		{:else if activeTab === "apikeys"}
			<ApiKeysSection />
		{/if}
	</div>
</div>
