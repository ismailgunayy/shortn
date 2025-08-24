<script lang="ts">
	import { browser } from '$app/environment';
	import { config } from '$lib';
	import { urlService } from '$lib/services/url';
	import GitHubIcon from '$lib/icons/GitHub.svelte';

	let url = $state('');
	let shortUrl = $state('');
	let loading = $state(false);
	let error = $state('');
	let copied = $state(false);

	async function shortenUrl(event: Event) {
		event.preventDefault();

		if (!url.trim()) {
			error = 'Please enter a URL';
			return;
		}

		// Basic URL validation
		if (config.env.VITE_MODE !== 'development' && !url.match(/^https:\/\/.+\..+/)) {
			error = 'Please enter a valid URL (starting with https://)';
			return;
		}

		loading = true;
		error = '';

		try {
			const result = await urlService.shortenUrl(url.trim());

			if (!result.success) {
				throw new Error(result.error || 'Failed to shorten URL');
			}

			if (result.data?.url) {
				shortUrl = result.data.url;
			} else {
				throw new Error('No shortened URL received');
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Something went wrong';
		} finally {
			loading = false;
		}
	}

	async function copyToClipboard() {
		if (!browser || !shortUrl) return;

		try {
			await navigator.clipboard.writeText(shortUrl);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	}

	function reset() {
		url = '';
		shortUrl = '';
		error = '';
		copied = false;
	}
</script>

<svelte:head>
	<title>Shortn - Simple URL Shortener</title>
	<meta
		name="description"
		content="Shorten your URLs quickly and easily with our minimal, elegant URL shortener."
	/>
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center px-4">
	<!-- Header -->
	<div class="mb-8 text-center sm:mb-12">
		<h1
			class="mb-3 bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-3xl font-bold text-transparent sm:mb-4 sm:text-4xl md:text-6xl"
		>
			Shortn
		</h1>
		<p
			class="mx-auto max-w-sm bg-gradient-to-r from-slate-400 to-slate-300/80 bg-clip-text px-2 text-transparent sm:max-w-lg sm:px-4 sm:text-lg md:text-xl"
		>
			Shortn your URLs. Simple, fast.
		</p>
	</div>

	<!-- Main Form -->
	<div class="w-full max-w-2xl px-4 sm:px-0">
		<div
			class="rounded-2xl border border-slate-600/40 bg-slate-600/25 p-6 shadow-2xl shadow-slate-900/20 backdrop-blur-3xl sm:p-8 md:p-12"
		>
			{#if !shortUrl}
				<!-- URL Input Form -->
				<form onsubmit={shortenUrl} class="space-y-4 sm:space-y-6">
					<div>
						<label for="url" class="mb-2 block text-sm font-medium text-slate-300">
							Enter your URL
						</label>
						<input
							id="url"
							type="url"
							bind:value={url}
							placeholder="https://example.com/your-very-long-url"
							class="duration-230 w-full rounded-xl border border-slate-500 bg-slate-800/40 px-4 py-2.5 text-base
								   text-slate-100 placeholder-slate-500 backdrop-blur-lg
								   transition-all focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/20
								   sm:py-3 sm:text-lg"
							disabled={loading}
							required
						/>
					</div>

					{#if error}
						<div
							class="rounded-lg border border-red-800/50 bg-red-900/20 p-3 text-sm text-red-300 backdrop-blur-lg"
						>
							{error}
						</div>
					{/if}

					<button
						type="submit"
						disabled={loading || !url.trim()}
						class="duration-230 w-full transform cursor-pointer rounded-xl bg-gradient-to-r
							   from-slate-500 to-slate-500/80 px-6 py-2.5 text-base font-semibold
							   text-slate-100 shadow-lg backdrop-blur-lg transition-all
							   hover:scale-[1.02] hover:from-slate-500 hover:to-slate-600 hover:shadow-xl hover:shadow-slate-900/30
							   focus:outline-none focus:ring-2 focus:ring-slate-400/20 active:scale-[0.98]
							   disabled:cursor-not-allowed disabled:opacity-50
							   sm:py-3 sm:text-lg"
					>
						{#if loading}
							<span class="flex items-center justify-center">
								<svg
									class="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle
										class="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										stroke-width="4"
									></circle>
									<path
										class="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									></path>
								</svg>
								Please wait
							</span>
						{:else}
							Generate
						{/if}
					</button>
				</form>
			{:else}
				<!-- Result Display -->
				<div class="space-y-4 text-center sm:space-y-6">
					<div class="text-base font-medium text-emerald-400 sm:text-lg">
						✨ URL shortened successfully!
					</div>

					<div
						class="rounded-xl border border-slate-600/30 bg-slate-800/20 p-4 backdrop-blur-lg sm:p-6"
					>
						<p class="mb-2 text-sm text-slate-400">Your short URL:</p>
						<div class="flex flex-col gap-3 sm:flex-row sm:items-center">
							<code
								class="flex-1 overflow-x-auto rounded-lg border border-slate-600/30 bg-slate-900/40 px-3 py-2 font-mono text-sm text-slate-200 backdrop-blur-lg sm:px-4 sm:text-base lg:text-lg"
							>
								{shortUrl}
							</code>
							<button
								onclick={copyToClipboard}
								class="duration-230 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-600/30 bg-slate-700/40 px-4 py-2 text-sm font-medium text-slate-300 backdrop-blur-lg
									   transition-all hover:bg-slate-600/40 hover:text-slate-200"
								title="Copy to clipboard"
							>
								{#if copied}
									<svg
										class="h-4 w-4 text-emerald-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M5 13l4 4L19 7"
										></path>
									</svg>
									<span class="text-emerald-400">Copied!</span>
								{:else}
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
										></path>
									</svg>
									<span>Copy</span>
								{/if}
							</button>
						</div>
					</div>

					<div class="flex flex-col gap-3 sm:flex-row">
						<a
							href={shortUrl}
							target="_blank"
							rel="noopener noreferrer"
							class="duration-230 flex-1 transform cursor-pointer rounded-xl bg-gradient-to-r
								   from-emerald-800 to-emerald-900 px-4 py-2.5 text-center text-sm font-semibold text-emerald-100 shadow-lg
								   backdrop-blur-lg transition-all hover:scale-[1.02] hover:from-emerald-700 hover:to-emerald-800
								   hover:shadow-xl hover:shadow-slate-900/30 active:scale-[0.98]
								   sm:px-6 sm:py-3 sm:text-base"
						>
							Visit Link
						</a>
						<button
							onclick={reset}
							class="duration-230 flex-1 transform cursor-pointer rounded-xl border border-slate-600/30 bg-slate-700/40 px-4
								   py-2.5 text-sm font-semibold text-slate-300 backdrop-blur-lg transition-all hover:scale-[1.02]
								   hover:bg-slate-600/40 hover:text-slate-200 active:scale-[0.98] sm:px-6 sm:py-3 sm:text-base"
						>
							Shorten Another
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<footer class="absolute bottom-0 mx-auto mb-2 flex">
		<a href="https://github.com/ismailgunayy/shortn" target="_blank">
			<GitHubIcon
				class="size-12 rounded-lg p-2 text-white transition hover:bg-white hover:text-slate-800"
			/>
		</a>
	</footer>
</div>
