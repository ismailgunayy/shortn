<script lang="ts">
	import { browser } from '$app/environment';
	import { urlService } from '$lib/services/url';

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
		if (!url.match(/^https?:\/\/.+\..+/)) {
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
			class="mb-3 bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-3xl font-bold text-transparent sm:mb-4 sm:text-4xl md:text-6xl dark:from-white dark:to-slate-300"
		>
			Shortn
		</h1>
		<p
			class="mx-auto max-w-sm px-2 text-base text-slate-600 sm:max-w-lg sm:px-4 sm:text-lg md:text-xl dark:text-slate-400"
		>
			Shortn your URLs. Simple, fast.
		</p>
	</div>

	<!-- Main Form -->
	<div class="w-full max-w-2xl px-4 sm:px-0">
		<div
			class="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8 md:p-12 dark:border-slate-700 dark:bg-slate-800"
		>
			{#if !shortUrl}
				<!-- URL Input Form -->
				<form onsubmit={shortenUrl} class="space-y-4 sm:space-y-6">
					<div>
						<label
							for="url"
							class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
						>
							Enter your URL
						</label>
						<input
							id="url"
							type="url"
							bind:value={url}
							placeholder="https://example.com/your-very-long-url"
							class="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base
								   text-slate-900 placeholder-slate-500 transition-all
								   duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500
								   sm:py-3 sm:text-lg
								   dark:border-slate-600 dark:bg-slate-700
								   dark:text-white dark:placeholder-slate-400"
							disabled={loading}
							required
						/>
					</div>

					{#if error}
						<div
							class="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
						>
							{error}
						</div>
					{/if}

					<button
						type="submit"
						disabled={loading || !url.trim()}
						class="w-full transform rounded-xl bg-gradient-to-r from-blue-600 to-blue-700
							   px-6 py-2.5 text-base font-semibold text-white shadow-lg
							   transition-all duration-200
							   hover:scale-[1.02] hover:from-blue-700 hover:to-blue-800 hover:shadow-xl active:scale-[0.98]
							   disabled:cursor-not-allowed disabled:opacity-50
							   sm:py-3 sm:text-lg"
					>
						{#if loading}
							<span class="flex items-center justify-center">
								<svg
									class="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
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
								Shortening...
							</span>
						{:else}
							Shorten URL
						{/if}
					</button>
				</form>
			{:else}
				<!-- Result Display -->
				<div class="space-y-4 text-center sm:space-y-6">
					<div class="text-base font-medium text-green-600 sm:text-lg dark:text-green-400">
						✨ URL shortened successfully!
					</div>

					<div
						class="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-6 dark:border-slate-600 dark:bg-slate-900"
					>
						<p class="mb-2 text-sm text-slate-600 dark:text-slate-400">Your short URL:</p>
						<div class="flex flex-col gap-3 sm:flex-row sm:items-center">
							<code
								class="flex-1 overflow-x-auto rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-blue-600 sm:px-4 sm:text-base lg:text-lg dark:border-slate-600 dark:bg-slate-800 dark:text-blue-400"
							>
								{shortUrl}
							</code>
							<button
								onclick={copyToClipboard}
								class="flex items-center justify-center gap-2 rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors
									   duration-200 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
								title="Copy to clipboard"
							>
								{#if copied}
									<svg
										class="h-4 w-4 text-green-600 dark:text-green-400"
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
									<span class="text-green-600 dark:text-green-400">Copied!</span>
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
							class="flex-1 transform rounded-xl bg-gradient-to-r from-green-600 to-green-700
								   px-4 py-2.5 text-center text-sm font-semibold text-white shadow-lg
								   transition-all duration-200 hover:scale-[1.02] hover:from-green-700 hover:to-green-800
								   hover:shadow-xl active:scale-[0.98]
								   sm:px-6 sm:py-3 sm:text-base"
						>
							Visit Link
						</a>
						<button
							onclick={reset}
							class="flex-1 transform rounded-xl bg-slate-200 px-4
								   py-2.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:scale-[1.02]
								   hover:bg-slate-300 active:scale-[0.98] sm:px-6 sm:py-3 sm:text-base
								   dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
						>
							Shorten Another
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Footer -->
	<div class="mt-12 px-4 text-center text-sm text-slate-500 sm:mt-16 dark:text-slate-400">
		<p>Built with ❤️ using SvelteKit</p>
	</div>
</div>
