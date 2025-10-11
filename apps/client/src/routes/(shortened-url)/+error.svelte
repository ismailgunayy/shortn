<script lang="ts">
	import { page } from "$app/state";
	import Error from "$lib/icons/error.svelte";
</script>

<svelte:head>
	<title>Shortn | URL Not Found</title>
	<meta
		name="robots"
		content="noindex"
	/>
</svelte:head>

<div class="flex items-center justify-center p-4">
	<div
		class="w-full max-w-sm rounded-xl border border-slate-600/60 bg-slate-600/25 p-6 text-center shadow-2xl shadow-slate-900/20 backdrop-blur-3xl sm:max-w-md sm:p-8"
	>
		<div class="mb-4 sm:mb-6">
			<div
				class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-red-800/30 bg-red-900/40 backdrop-blur-lg sm:mb-4 sm:h-16 sm:w-16"
			>
				<Error />
			</div>
			<h1 class="text-bright mb-2 text-xl font-bold sm:text-2xl">URL Not Found</h1>
		</div>

		<div class="mb-6 rounded-lg border border-slate-600/60 bg-slate-800/40 p-3 backdrop-blur-lg">
			<p class="text-secondary text-sm">
				<span class="text-error font-mono">{page.url.href || "unknown"}</span>
			</p>
		</div>

		<div class="space-y-3">
			<p class="text-secondary text-sm">This could happen if:</p>
			<ul class="text-bright ml-4 list-disc space-y-1 text-left text-sm">
				<li>The URL was typed incorrectly</li>
				<li>The URL was never created</li>
				<li>I'm not a good developer</li>
			</ul>
		</div>

		<div class="mt-4 sm:mt-6">
			<a
				href="/"
				class="text-md text-button-color inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-slate-600 to-slate-700 px-4 py-3 font-medium backdrop-blur-lg transition-all hover:scale-[1.02] hover:from-slate-500 hover:to-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20"
			>
				Shorten your own URL
			</a>
		</div>
	</div>
</div>
