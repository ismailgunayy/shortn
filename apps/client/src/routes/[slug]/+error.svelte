<script lang="ts">
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>Link Not Found - Shortn</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 dark:from-slate-900 dark:to-slate-800"
>
	<div
		class="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-lg sm:max-w-md sm:p-8 dark:bg-slate-800"
	>
		<div class="mb-4 sm:mb-6">
			<div
				class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 sm:mb-4 sm:h-16 sm:w-16 dark:bg-red-900"
			>
				<svg
					class="h-6 w-6 text-red-600 sm:h-8 sm:w-8 dark:text-red-400"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
					/>
				</svg>
			</div>
			<h1 class="mb-2 text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">
				Link Not Found
			</h1>
			<p class="text-sm text-slate-600 sm:text-base dark:text-slate-300">
				The short link you're looking for doesn't exist or has expired.
			</p>
		</div>

		<div class="mb-6 rounded-lg bg-slate-100 p-3 dark:bg-slate-700">
			<p class="text-sm text-slate-600 dark:text-slate-300">
				Short URL: <span class="font-mono text-red-600 dark:text-red-400"
					>/{$page.params.slug || 'unknown'}</span
				>
			</p>
			<p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
				Error: {$page.error?.message || 'Link not found'}
			</p>
		</div>

		<div class="space-y-3">
			<p class="text-sm text-slate-500 dark:text-slate-400">This could happen if:</p>
			<ul class="space-y-1 text-left text-sm text-slate-500 dark:text-slate-400">
				<li>• The link was typed incorrectly</li>
				<li>• The link has expired or been deleted</li>
				<li>• The link was never created</li>
			</ul>
		</div>

		<div class="mt-4 space-y-3 sm:mt-6">
			<a
				href="/"
				class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
					/>
				</svg>
				Create Your Own Short Link
			</a>

			<button
				onclick={() => history.back()}
				class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 19l-7-7m0 0l7-7m-7 7h18"
					/>
				</svg>
				Go Back
			</button>
		</div>
	</div>
</div>
