<script lang="ts">
	import type { UrlItem, CustomUrlItem } from '$lib/types/api.types';
	import { api } from '$lib/api/api.client';
	import CheckMark from '$lib/icons/CheckMark.svelte';
	import Edit from '$lib/icons/Edit.svelte';
	import Delete from '$lib/icons/Delete.svelte';

	interface Props {
		urls: UrlItem[];
		customUrls: CustomUrlItem[];
		onUrlDeleted: (id: number, isCustom: boolean) => void;
	}

	let { urls, customUrls, onUrlDeleted }: Props = $props();

	let copiedId: string | null = $state(null);
	let copiedTimeout: ReturnType<typeof setTimeout> | null = $state(null);

	async function deleteUrl(id: number, shortenedUrl: string, isCustom = false) {
		if (!confirm('Are you sure you want to delete this URL?')) return;

		try {
			const response = await api.url.deleteUrl(id, { shortenedUrl });

			if (response.error) {
				throw new Error(response.error.message);
			}

			onUrlDeleted(id, isCustom);
		} catch (err) {
			alert(err instanceof Error ? err.message : 'Failed to delete URL');
		}
	}

	async function copyToClipboard(text: string, id: string) {
		try {
			await navigator.clipboard.writeText(text);
			copiedId = id;
			if (copiedTimeout) clearTimeout(copiedTimeout);

			copiedTimeout = setTimeout(() => {
				copiedId = null;
			}, 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	}

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			hour12: false
		});
	};
</script>

<div class="space-y-6">
	<!-- Custom URLs -->
	{#if customUrls.length > 0}
		<div>
			<h2 class="text-heading-3 text-bright mb-4 font-semibold">Custom URLs</h2>

			<!-- Desktop Table View -->
			<div
				class="hidden overflow-hidden rounded-lg border border-slate-600/60 bg-slate-700/40 backdrop-blur-lg md:block"
			>
				<table class="w-full table-fixed">
					<thead class="bg-slate-600/40">
						<tr>
							<th class="text-body-small text-bright w-6/12 px-4 py-3 text-left font-medium"
								>Original URL</th
							>
							<th class="text-body-small text-bright w-3/12 px-4 py-3 text-left font-medium"
								>Short Code</th
							>
							<th class="text-body-small text-bright w-2/12 px-4 py-3 text-left font-medium"
								>Created Date</th
							>
							<th class="text-body-small text-bright w-1/12 px-4 py-3 text-left font-medium"
								>Edit</th
							>
							<th class="text-body-small text-bright w-1/12 px-4 py-3 text-left font-medium"
								>Delete</th
							>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-600/30">
						{#each customUrls as url}
							<tr class="hover:bg-slate-600/20">
								<td class="px-4 py-3">
									<div class="flex items-center gap-2">
										<button
											onclick={() => copyToClipboard(url.originalUrl, `custom-original-${url.id}`)}
											class="text-body-small scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-600 hover:scrollbar-thumb-slate-500 text-secondary hover:text-bright max-w-full cursor-pointer overflow-x-auto rounded bg-slate-900/60 px-2 py-1 text-left hover:bg-slate-800/80"
											title="Click to copy: {url.originalUrl}"
										>
											<span class="whitespace-nowrap">{url.originalUrl}</span>
										</button>
										{#if copiedId === `custom-original-${url.id}`}
											<CheckMark class="text-success h-4 w-4" />
										{/if}
									</div>
								</td>
								<td class="px-4 py-3">
									<div class="flex items-center gap-2">
										<button
											onclick={() => copyToClipboard(url.shortenedUrl, `custom-${url.id}`)}
											class="text-body-small scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-600 hover:scrollbar-thumb-slate-500 text-secondary hover:text-bright cursor-pointer overflow-x-auto rounded bg-slate-900/60 px-2 py-1 hover:bg-slate-800/80"
										>
											<span class="whitespace-nowrap">{url.customCode}</span>
										</button>
										{#if copiedId === `custom-${url.id}`}
											<CheckMark class="text-success h-4 w-4" />
										{/if}
									</div>
								</td>
								<td class="px-4 py-3">
									<span class="text-body-small text-tertiary">{formatDate(url.createdAt)}</span>
								</td>
								<td class="px-4 py-3">
									<button
										class="text-caption text-tertiary hover:text-secondary cursor-pointer rounded px-2 py-1 hover:bg-slate-600/40"
										disabled
									>
										<Edit class="h-4 w-4" />
									</button>
								</td>
								<td class="px-4 py-3">
									<button
										onclick={() => deleteUrl(url.id, url.shortenedUrl, true)}
										class="text-caption text-error cursor-pointer rounded px-2 py-1 hover:bg-red-900/20 hover:text-red-300"
									>
										<Delete class="h-4 w-4" />
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- Mobile Card View -->
			<div class="block space-y-3 md:hidden">
				{#each customUrls as url}
					<div class="relative">
						<div class="rounded-lg border border-slate-600/60 bg-slate-700/40 p-4 backdrop-blur-lg">
							<div class="flex items-start justify-between gap-4">
								<div class="min-w-0 flex-1">
									<div class="mb-2 flex items-center gap-2">
										<button
											onclick={() => copyToClipboard(url.shortenedUrl, `custom-${url.id}`)}
											class="text-body-small scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-600 hover:scrollbar-thumb-slate-500 text-secondary hover:text-bright cursor-pointer overflow-x-auto rounded bg-slate-900/60 px-2 py-1 hover:bg-slate-800/80"
										>
											<span class="whitespace-nowrap">{url.customCode}</span>
										</button>
										<span class="text-caption rounded bg-purple-800/60 px-2 py-1 text-purple-300">
											Custom
										</span>
									</div>
									<button
										onclick={() => copyToClipboard(url.originalUrl, `custom-mobile-${url.id}`)}
										class="text-body-small scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-600 hover:scrollbar-thumb-slate-500 text-secondary hover:text-bright mb-1 max-w-full cursor-pointer overflow-x-auto rounded bg-slate-900/60 px-2 py-1 text-left hover:bg-slate-800/80"
										title="Click to copy: {url.originalUrl}"
									>
										<span class="whitespace-nowrap">→ {url.originalUrl}</span>
									</button>
									<p class="text-caption text-muted">Created {formatDate(url.createdAt)}</p>
								</div>
								<div class="flex gap-2">
									<button
										class="text-caption text-tertiary hover:text-secondary cursor-pointer rounded px-2 py-1 hover:bg-slate-600/40"
										disabled
									>
										<Edit class="h-4 w-4" />
									</button>
									<button
										onclick={() => deleteUrl(url.id, url.shortenedUrl, true)}
										class="text-caption text-error cursor-pointer rounded px-2 py-1 hover:bg-red-900/20 hover:text-red-300"
									>
										<Delete class="h-4 w-4" />
									</button>
								</div>
							</div>
						</div>
						<!-- Checkmarks positioned outside the card -->
						{#if copiedId === `custom-${url.id}`}
							<div class="absolute left-2 top-2">
								<CheckMark class="text-success h-5 w-5" />
							</div>
						{/if}
						{#if copiedId === `custom-mobile-${url.id}`}
							<div class="absolute left-2 top-12">
								<CheckMark class="text-success h-5 w-5" />
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Generated URLs -->
	{#if urls.length > 0}
		<div>
			<h2 class="text-heading-3 text-bright mb-4 font-semibold">Generated URLs</h2>

			<!-- Desktop Table View -->
			<div
				class="hidden overflow-hidden rounded-lg border border-slate-600/60 bg-slate-700/40 backdrop-blur-lg md:block"
			>
				<table class="w-full table-fixed">
					<thead class="bg-slate-600/40">
						<tr>
							<th class="text-body-small text-bright w-6/12 px-4 py-3 text-left font-medium"
								>Original URL</th
							>
							<th class="text-body-small text-bright w-3/12 px-4 py-3 text-left font-medium"
								>Short Code</th
							>
							<th class="text-body-small text-bright w-3/12 px-4 py-3 text-left font-medium"
								>Created Date</th
							>
							<th class="text-body-small text-bright w-1/12 px-4 py-3 text-left font-medium"
								>Delete</th
							>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-600/30">
						{#each urls as url}
							<tr class="hover:bg-slate-600/20">
								<td class="px-4 py-3">
									<div class="flex items-center gap-2">
										<button
											onclick={() => copyToClipboard(url.originalUrl, `url-original-${url.id}`)}
											class="text-body-small scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-600 hover:scrollbar-thumb-slate-500 text-secondary hover:text-bright max-w-full cursor-pointer overflow-x-auto rounded bg-slate-900/60 px-2 py-1 text-left hover:bg-slate-800/80"
											title="Click to copy: {url.originalUrl}"
										>
											<span class="whitespace-nowrap">{url.originalUrl}</span>
										</button>
										{#if copiedId === `url-original-${url.id}`}
											<CheckMark class="text-success h-4 w-4" />
										{/if}
									</div>
								</td>
								<td class="px-4 py-3">
									<div class="flex items-center gap-2">
										<button
											onclick={() => copyToClipboard(url.shortenedUrl, `url-${url.id}`)}
											class="text-body-small scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-600 hover:scrollbar-thumb-slate-500 text-secondary hover:text-bright cursor-pointer overflow-x-auto rounded bg-slate-900/60 px-2 py-1 hover:bg-slate-800/80"
										>
											<span class="whitespace-nowrap">{url.shortCode}</span>
										</button>
										{#if copiedId === `url-${url.id}`}
											<CheckMark class="text-success h-4 w-4" />
										{/if}
									</div>
								</td>
								<td class="px-4 py-3">
									<span class="text-body-small text-tertiary">{formatDate(url.createdAt)}</span>
								</td>
								<td class="px-4 py-3">
									<button
										onclick={() => deleteUrl(url.id, url.shortenedUrl, false)}
										class="text-caption text-error cursor-pointer rounded px-2 py-1 hover:bg-red-900/20 hover:text-red-300"
									>
										<Delete class="h-4 w-4" />
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- Mobile Card View -->
			<div class="block space-y-3 md:hidden">
				{#each urls as url}
					<div class="relative">
						<div class="rounded-lg border border-slate-600/60 bg-slate-700/40 p-4 backdrop-blur-lg">
							<div class="flex items-start justify-between gap-4">
								<div class="min-w-0 flex-1">
									<div class="mb-2 flex items-center gap-2">
										<button
											onclick={() => copyToClipboard(url.shortenedUrl, `url-${url.id}`)}
											class="text-body-small scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-600 hover:scrollbar-thumb-slate-500 text-secondary hover:text-bright cursor-pointer overflow-x-auto rounded bg-slate-900/60 px-2 py-1 hover:bg-slate-800/80"
										>
											<span class="whitespace-nowrap">{url.shortCode}</span>
										</button>
									</div>
									<button
										onclick={() => copyToClipboard(url.originalUrl, `url-mobile-${url.id}`)}
										class="text-body-small scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-600 hover:scrollbar-thumb-slate-500 text-secondary hover:text-bright mb-1 max-w-full cursor-pointer overflow-x-auto rounded bg-slate-900/60 px-2 py-1 text-left hover:bg-slate-800/80"
										title="Click to copy: {url.originalUrl}"
									>
										<span class="whitespace-nowrap">→ {url.originalUrl}</span>
									</button>
									<p class="text-caption text-muted">Created {formatDate(url.createdAt)}</p>
								</div>
								<button
									onclick={() => deleteUrl(url.id, url.shortenedUrl, false)}
									class="text-caption text-error cursor-pointer rounded px-3 py-1 hover:bg-red-900/20 hover:text-red-300"
								>
									<Delete class="h-4 w-4" />
								</button>
							</div>
						</div>
						<!-- Checkmarks positioned outside the card -->
						{#if copiedId === `url-${url.id}`}
							<div class="absolute left-2 top-2">
								<CheckMark class="text-success h-5 w-5" />
							</div>
						{/if}
						{#if copiedId === `url-mobile-${url.id}`}
							<div class="absolute left-2 top-12">
								<CheckMark class="text-success h-5 w-5" />
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- No URLs Message -->
	{#if urls.length === 0 && customUrls.length === 0}
		<div
			class="rounded-lg border border-slate-600/60 bg-slate-700/40 p-8 text-center backdrop-blur-lg"
		>
			<p class="text-body text-secondary mb-2">No URLs yet</p>
			<p class="text-body-small text-muted">Start by creating your first short URL!</p>
			<a
				href="/"
				class="text-button-small text-button-color mt-4 inline-block rounded-lg bg-slate-600/60 px-4 py-2 hover:bg-slate-600/80"
			>
				Create URL
			</a>
		</div>
	{/if}
</div>
