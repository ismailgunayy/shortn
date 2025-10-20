<script lang="ts">
	import CheckMark from "$lib/icons/check-mark.icon.svelte";
	import Copy from "$lib/icons/copy.icon.svelte";
	import Loading from "$lib/icons/loading.icon.svelte";
	import UpgradeModal from "$lib/components/modals/upgrade.modal.svelte";
	import { config } from "$lib/common/config";
	import { shortenUrl } from "$lib/utils/shorten-url.util";
	import { authStore } from "$lib/stores/auth.store";
	import { toastService } from "$lib/services/toast.service";
	import { clientApi } from "$lib/services/api/api.client";

	let url = $state("");
	let customCode = $state("");
	let shortenedUrl = $state("");
	let loading = $state(false);
	let copied = $state(false);
	let showUpgradeModal = $state(false);
	let isAuthenticated = $derived(() => $authStore.user && !$authStore.loading);

	async function handleSubmit(event: Event) {
		event.preventDefault();

		if (customCode.trim() && !isAuthenticated()) {
			showUpgradeModal = true;
			return;
		}

		loading = true;

		let response;

		// If the user is not authenticated, meaning the URL will be shortened via service account,
		// Using the server-side /api/shorten endpoint to avoid exposing the API key to the client
		// The endpoint will call the backend API from server side
		if (isAuthenticated()) {
			response = await clientApi.url.shortenUrl({ url: url.trim(), customCode: customCode.trim() });
		} else {
			response = await shortenUrl(url.trim());
		}

		if (response.data?.url) {
			shortenedUrl = response.data.url;
		}

		loading = false;
	}

	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(shortenedUrl);
			copied = true;
			setTimeout(() => (copied = false), 2300);
		} catch {
			toastService.error("Failed to copy to clipboard.");
		}
	}

	function reset() {
		url = "";
		customCode = "";
		shortenedUrl = "";
		loading = false;
		copied = false;
	}
</script>

<svelte:head>
	<title>Shortn | URL Shortener</title>
	<meta
		name="description"
		content="Shortn your URLs. Simple, fast."
	/>
</svelte:head>

<div class="flex flex-col items-center justify-center px-4">
	<!-- Title -->
	<div class="mb-8 text-center sm:mb-12">
		<h1
			class="text-display mb-3 bg-gradient-to-r from-slate-400 to-slate-200 bg-clip-text font-bold text-transparent sm:mb-4"
		>
			Shortn
		</h1>
		<p
			class="text-heading-3 mx-auto max-w-sm bg-gradient-to-r from-slate-300 to-slate-100 bg-clip-text text-transparent sm:max-w-lg sm:px-4"
		>
			Shortn your URLs. Simple. Fast.
		</p>
	</div>
	<!-- Main Container -->
	<div class="w-full max-w-2xl px-4 opacity-90 sm:px-0">
		<div
			class="rounded-2xl border border-slate-600/60 bg-slate-600/25 p-6 shadow-2xl shadow-slate-900/20 backdrop-blur-3xl sm:p-8 md:p-12"
		>
			{#if !shortenedUrl}
				<!-- URL Input Form -->
				<form
					onsubmit={handleSubmit}
					class="space-y-4 sm:space-y-6"
				>
					<!--  URL Input -->
					<div>
						<label
							for="url"
							class="text-form-label"
						>
							Enter your URL
						</label>
						<input
							id="url"
							type="url"
							bind:value={url}
							placeholder="https://example.com/very-long-url"
							class="text-form-input mt-1 w-full rounded-xl border border-slate-600/60 bg-slate-800/40 px-4 py-2.5
									   placeholder-slate-500 backdrop-blur-lg transition-all
									   duration-200 focus:border-slate-500/80 focus:ring-2 focus:ring-slate-400/20 focus:outline-none
									   sm:py-3"
							disabled={loading}
							required
						/>
					</div>
					<!-- Custom Code Input -->
					<div>
						<label
							for="customCode"
							class="text-form-label"
						>
							Custom code (Optional)
						</label>
						<div
							class="mt-1 flex items-center rounded-xl border border-slate-600/60 bg-slate-800/40 backdrop-blur-lg transition-all duration-200 focus-within:border-slate-500/80 focus-within:ring-2 focus-within:ring-slate-400/20"
						>
							<span class="text-form-input text-muted py-2.5 pl-4 sm:py-3">{config.HTTP.CLIENT_HOST}/c/</span>
							<input
								id="customCode"
								type="text"
								bind:value={customCode}
								placeholder="custom-code"
								class="text-form-input flex-1 border-none bg-transparent py-2.5 pr-4 pl-0.5 placeholder-slate-500 outline-none focus:ring-0 sm:py-3"
								disabled={loading}
								onclick={() => {
									if (!isAuthenticated()) {
										showUpgradeModal = true;
									}
								}}
								readonly={!isAuthenticated()}
								pattern="[a-zA-Z0-9_\-]+"
								title="Only letters, numbers, hyphens, and underscores allowed"
							/>
						</div>
					</div>

					<button
						type="submit"
						disabled={loading || !url.trim()}
						class="text-button text-button-color w-full transform rounded-xl bg-gradient-to-r
							   from-slate-400/80 to-slate-600/80 px-6 py-2.5 font-semibold
							   shadow-lg backdrop-blur-lg transition-all duration-200
							   hover:scale-[1.02] hover:from-slate-400 hover:to-slate-600 hover:shadow-xl hover:shadow-slate-900/30
							   focus:ring-2 focus:ring-slate-400/20 focus:outline-none active:scale-[0.98]
							   disabled:opacity-50
							   sm:py-3"
					>
						{#if loading}
							<span class="flex items-center justify-center">
								<Loading />
								Please wait
							</span>
						{:else}
							<span class="flex items-center justify-center gap-2"> Create </span>
						{/if}
					</button>
				</form>
			{:else}
				<!-- Result Display -->
				<div class="space-y-4 text-center sm:space-y-6">
					<div class="rounded-xl border border-slate-600/60 bg-slate-700/40 p-4 backdrop-blur-lg sm:p-6">
						<p class="text-body text-secondary mb-2">Your short URL:</p>
						<div class="flex flex-col gap-3 sm:flex-row sm:items-center">
							<code
								class="text-body text-bright flex-1 overflow-x-auto rounded-lg border border-slate-600/60 bg-slate-900/40 px-3 py-2 font-mono backdrop-blur-lg sm:px-4"
							>
								{shortenedUrl.replace(/^(https?:\/\/)/, "")}
							</code>
							<button
								onclick={copyToClipboard}
								class="text-button-small text-secondary hover:text-bright flex items-center justify-center gap-2 rounded-lg border border-slate-600/60 bg-slate-700/40 px-4 py-2 font-medium backdrop-blur-lg
									   transition-all duration-230 hover:bg-slate-600/40"
								title="Copy to clipboard"
							>
								{#if copied}
									<CheckMark />
									<span class="text-success">Done</span>
								{:else}
									<Copy />
									<span>Copy</span>
								{/if}
							</button>
						</div>
					</div>

					<div class="flex flex-col gap-3 sm:flex-row">
						<a
							href={shortenedUrl}
							target="_blank"
							rel="noopener noreferrer"
							class="text-button text-success flex-1 transform cursor-pointer rounded-xl bg-gradient-to-r
								   from-emerald-800/80 to-emerald-700/80 px-4 py-2.5 text-center font-semibold shadow-lg backdrop-blur-lg
								   transition-all duration-230 hover:scale-[1.02] hover:from-emerald-800 hover:to-emerald-700
								   hover:shadow-xl hover:shadow-slate-900/30 active:scale-[0.98]
								   sm:px-6 sm:py-3"
						>
							Visit URL
						</a>
						<button
							onclick={reset}
							class="text-button text-secondary hover:text-bright flex-1 transform rounded-xl border border-slate-600/60 bg-gradient-to-r from-slate-600/40 to-slate-700
								   px-4 py-2.5 font-semibold backdrop-blur-lg transition-all duration-230
								   hover:scale-[1.02] hover:bg-slate-600/40 active:scale-[0.98] sm:px-6 sm:py-3"
						>
							Shorten Another
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- Upgrade Modal -->
<UpgradeModal bind:isOpen={showUpgradeModal} />
