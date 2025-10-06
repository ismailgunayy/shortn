<script lang="ts">
	import { api } from "$lib/api/api.client";
	import CheckMark from "$lib/icons/CheckMark.svelte";
	import Copy from "$lib/icons/Copy.svelte";
	import Edit from "$lib/icons/Edit.svelte";
	import Delete from "$lib/icons/Delete.svelte";
	import Loading from "$lib/icons/Loading.svelte";
	import { formatDate } from "$lib/utils/formatDate";
	import type { CustomUrlItem, UpdateCustomUrlRequest, UrlItem } from "$lib/api/services/url.service";

	interface Props {
		urls: UrlItem[];
		customUrls: CustomUrlItem[];
		onUrlDeleted: (id: number, isCustom: boolean) => void;
		onUrlUpdated: (updatedUrl: CustomUrlItem) => void;
	}

	let { urls, customUrls, onUrlDeleted, onUrlUpdated }: Props = $props();

	let copiedId: string | null = $state(null);
	let copiedTimeout: ReturnType<typeof setTimeout> | null = $state(null);
	let editingUrl: UpdateCustomUrlRequest | null = $state(null);
	let editOriginalUrl = $state("");
	let updatingUrl = $state(false);

	async function deleteUrl(id: number, shortenedUrl: string, isCustom = false) {
		if (!confirm("Are you sure you want to delete this URL?")) return;

		try {
			const response = await api.url.deleteUrl(id, { shortenedUrl });

			if (response.error) {
				throw new Error(response.error.message);
			}

			onUrlDeleted(id, isCustom);
		} catch (err) {
			alert(err instanceof Error ? err.message : "Failed to delete URL");
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
			console.error("Failed to copy:", err);
		}
	}

	async function updateCustomUrl() {
		if (!editingUrl || !editOriginalUrl.trim()) return;

		updatingUrl = true;

		try {
			const response = await api.url.updateCustomUrl({
				id: editingUrl.id,
				originalUrl: editOriginalUrl.trim()
			});

			if (response.error) {
				throw new Error(response.error.message);
			}

			if (response.data) {
				onUrlUpdated({
					id: response.data.id,
					originalUrl: response.data.originalUrl,
					shortenedUrl: response.data.shortenedUrl,
					customCode: response.data.customCode,
					createdAt: response.data.createdAt
				});
				editingUrl = null;
				editOriginalUrl = "";
			}
		} catch (err) {
			alert(err instanceof Error ? err.message : "Failed to update custom URL");
		} finally {
			updatingUrl = false;
		}
	}

	function startEditingUrl(url: CustomUrlItem) {
		editingUrl = { id: url.id, originalUrl: url.originalUrl };
		editOriginalUrl = url.originalUrl;
	}

	function cancelEditingUrl() {
		editingUrl = null;
		editOriginalUrl = "";
	}
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
							<th class="text-body-small text-bright w-6/12 px-4 py-3 text-left font-medium">Original URL</th>
							<th class="text-body-small text-bright w-3/12 px-4 py-3 text-left font-medium">Short Code</th>
							<th class="text-body-small text-bright w-2/12 px-4 py-3 text-left font-medium">Created Date</th>
							<th class="text-body-small text-bright w-1/12 px-4 py-3 text-left font-medium">Actions</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-600/30">
						{#each customUrls as url (url.id)}
							<tr class="hover:bg-slate-600/20">
								<td class="px-4 py-3">
									<div class="flex items-center gap-2">
										{#if editingUrl?.id === url.id}
											<div class="flex w-full items-center gap-2">
												<input
													bind:value={editOriginalUrl}
													class="text-form-input w-min flex-1 rounded-xl border border-slate-600/60 bg-slate-800/40 px-3 py-2 placeholder-slate-500 backdrop-blur-lg transition-all duration-200 focus:border-slate-500/80 focus:outline-none focus:ring-2 focus:ring-slate-400/20"
													placeholder="Original Url"
													onkeydown={(e) => e.key === "Enter" && updateCustomUrl()}
												/>
												<button
													onclick={updateCustomUrl}
													disabled={updatingUrl || !editOriginalUrl.trim()}
													class="text-caption text-success cursor-pointer rounded bg-emerald-800/60 px-2 py-1 hover:bg-emerald-800/80 disabled:opacity-50"
												>
													{#if updatingUrl}
														<Loading class="h-3 w-3" />
													{:else}
														Save
													{/if}
												</button>
												<button
													onclick={cancelEditingUrl}
													class="text-caption text-secondary cursor-pointer rounded bg-slate-600/60 px-2 py-1 hover:bg-slate-600/80"
												>
													Cancel
												</button>
											</div>
										{:else}
											<div class="max-w-full overflow-x-auto">
												<span class="text-body-small text-bright whitespace-nowrap">{url.originalUrl}</span>
											</div>
											<button
												onclick={() => copyToClipboard(url.originalUrl, `custom-original-${url.id}`)}
												class="text-secondary hover:text-bright cursor-pointer rounded p-1 hover:bg-slate-600/40"
												title="Copy original URL"
											>
												{#if copiedId === `custom-original-${url.id}`}
													<CheckMark class="text-success h-4 w-4" />
												{:else}
													<Copy class="h-4 w-4" />
												{/if}
											</button>
										{/if}
									</div>
								</td>
								<td class="px-4 py-3">
									<div class="flex items-center gap-2">
										<span class="text-body-small text-bright whitespace-nowrap">{url.customCode}</span>
										<button
											onclick={() => copyToClipboard(url.shortenedUrl, `custom-${url.id}`)}
											class="text-secondary hover:text-bright cursor-pointer rounded p-1 hover:bg-slate-600/40"
											title="Copy shortened URL"
										>
											{#if copiedId === `custom-${url.id}`}
												<CheckMark class="text-success h-4 w-4" />
											{:else}
												<Copy class="h-4 w-4" />
											{/if}
										</button>
									</div>
								</td>
								<td class="px-4 py-3">
									<span class="text-body-small text-tertiary">{formatDate(url.createdAt)}</span>
								</td>
								<td class="px-4 py-3">
									{#if editingUrl?.id !== url.id}
										<div class="flex gap-1">
											<button
												onclick={() => startEditingUrl(url)}
												class="text-caption text-tertiary hover:text-secondary cursor-pointer rounded px-2 py-1 hover:bg-slate-600/40"
												title="Edit original URL"
											>
												<Edit class="h-4 w-4" />
											</button>
											<button
												onclick={() => deleteUrl(url.id, url.shortenedUrl, true)}
												class="text-caption text-error cursor-pointer rounded px-2 py-1 hover:bg-red-900/20 hover:text-red-300"
												title="Delete URL"
											>
												<Delete class="h-4 w-4" />
											</button>
										</div>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- Mobile Card View -->
			<div class="block space-y-3 md:hidden">
				{#each customUrls as url (url.id)}
					<div class="relative">
						<div class="rounded-lg border border-slate-600/60 bg-slate-700/40 p-4 backdrop-blur-lg">
							{#if editingUrl?.id === url.id}
								<div class="space-y-3">
									<div class="flex items-center gap-2">
										<input
											bind:value={editOriginalUrl}
											class="text-form-input flex-1 rounded-xl border border-slate-600/60 bg-slate-800/40 px-3 py-2 placeholder-slate-500 backdrop-blur-lg transition-all duration-200 focus:border-slate-500/80 focus:outline-none focus:ring-2 focus:ring-slate-400/20"
											placeholder="Original Url"
											onkeydown={(e) => e.key === "Enter" && updateCustomUrl()}
										/>
										<button
											onclick={updateCustomUrl}
											disabled={updatingUrl || !editOriginalUrl.trim()}
											class="text-caption text-success cursor-pointer rounded bg-emerald-800/60 px-2 py-1 hover:bg-emerald-800/80 disabled:opacity-50"
										>
											{#if updatingUrl}
												<Loading class="h-3 w-3" />
											{:else}
												Save
											{/if}
										</button>
										<button
											onclick={cancelEditingUrl}
											class="text-caption text-secondary cursor-pointer rounded bg-slate-600/60 px-2 py-1 hover:bg-slate-600/80"
										>
											Cancel
										</button>
									</div>
									<p class="text-caption text-muted">Created {formatDate(url.createdAt)}</p>
								</div>
							{:else}
								<div class="flex items-start justify-between gap-4">
									<div class="min-w-0 flex-1">
										<div class="mb-2 flex items-center gap-2">
											<span class="text-body-small text-bright whitespace-nowrap">{url.customCode}</span>
											<button
												onclick={() => copyToClipboard(url.shortenedUrl, `custom-${url.id}`)}
												class="text-secondary hover:text-bright cursor-pointer rounded p-1 hover:bg-slate-600/40"
												title="Copy shortened URL"
											>
												{#if copiedId === `custom-${url.id}`}
													<CheckMark class="text-success h-4 w-4" />
												{:else}
													<Copy class="h-4 w-4" />
												{/if}
											</button>
										</div>
										<div class="mb-1 flex items-center gap-2">
											<div class="max-w-full overflow-x-auto">
												<span class="text-body-small text-bright whitespace-nowrap">→ {url.originalUrl}</span>
											</div>
											<button
												onclick={() => copyToClipboard(url.originalUrl, `custom-mobile-${url.id}`)}
												class="text-secondary hover:text-bright cursor-pointer rounded p-1 hover:bg-slate-600/40"
												title="Copy original URL"
											>
												{#if copiedId === `custom-mobile-${url.id}`}
													<CheckMark class="text-success h-4 w-4" />
												{:else}
													<Copy class="h-4 w-4" />
												{/if}
											</button>
										</div>
										<p class="text-caption text-muted">Created {formatDate(url.createdAt)}</p>
									</div>
									<div class="flex gap-2">
										<button
											onclick={() => startEditingUrl(url)}
											class="text-caption text-tertiary hover:text-secondary cursor-pointer rounded px-2 py-1 hover:bg-slate-600/40"
											title="Edit original URL"
										>
											<Edit class="h-4 w-4" />
										</button>
										<button
											onclick={() => deleteUrl(url.id, url.shortenedUrl, true)}
											class="text-caption text-error cursor-pointer rounded px-2 py-1 hover:bg-red-900/20 hover:text-red-300"
											title="Delete URL"
										>
											<Delete class="h-4 w-4" />
										</button>
									</div>
								</div>
							{/if}
						</div>
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
							<th class="text-body-small text-bright w-6/12 px-4 py-3 text-left font-medium">Original URL</th>
							<th class="text-body-small text-bright w-3/12 px-4 py-3 text-left font-medium">Short Code</th>
							<th class="text-body-small text-bright w-2/12 px-4 py-3 text-left font-medium">Created Date</th>
							<th class="text-body-small text-bright w-1/12 px-4 py-3 text-left font-medium">Delete</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-600/30">
						{#each urls as url (url.id)}
							<tr class="hover:bg-slate-600/20">
								<td class="px-4 py-3">
									<div class="flex items-center gap-2">
										<div class="max-w-full overflow-x-auto">
											<span class="text-body-small text-bright whitespace-nowrap">{url.originalUrl}</span>
										</div>
										<button
											onclick={() => copyToClipboard(url.originalUrl, `url-original-${url.id}`)}
											class="text-secondary hover:text-bright cursor-pointer rounded p-1 hover:bg-slate-600/40"
											title="Copy original URL"
										>
											{#if copiedId === `url-original-${url.id}`}
												<CheckMark class="text-success h-4 w-4" />
											{:else}
												<Copy class="h-4 w-4" />
											{/if}
										</button>
									</div>
								</td>
								<td class="px-4 py-3">
									<div class="flex items-center gap-2">
										<span class="text-body-small text-bright whitespace-nowrap">{url.shortCode}</span>
										<button
											onclick={() => copyToClipboard(url.shortenedUrl, `url-${url.id}`)}
											class="text-secondary hover:text-bright cursor-pointer rounded p-1 hover:bg-slate-600/40"
											title="Copy shortened URL"
										>
											{#if copiedId === `url-${url.id}`}
												<CheckMark class="text-success h-4 w-4" />
											{:else}
												<Copy class="h-4 w-4" />
											{/if}
										</button>
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
				{#each urls as url (url.id)}
					<div class="relative">
						<div class="rounded-lg border border-slate-600/60 bg-slate-700/40 p-4 backdrop-blur-lg">
							<div class="flex items-start justify-between gap-4">
								<div class="min-w-0 flex-1">
									<div class="mb-2 flex items-center gap-2">
										<span class="text-body-small text-bright whitespace-nowrap">{url.shortCode}</span>
										<button
											onclick={() => copyToClipboard(url.shortenedUrl, `url-${url.id}`)}
											class="text-secondary hover:text-bright cursor-pointer rounded p-1 hover:bg-slate-600/40"
											title="Copy shortened URL"
										>
											{#if copiedId === `url-${url.id}`}
												<CheckMark class="text-success h-4 w-4" />
											{:else}
												<Copy class="h-4 w-4" />
											{/if}
										</button>
									</div>
									<div class="mb-1 flex items-center gap-2">
										<div class="max-w-full overflow-x-auto">
											<span class="text-body-small text-bright whitespace-nowrap">→ {url.originalUrl}</span>
										</div>
										<button
											onclick={() => copyToClipboard(url.originalUrl, `url-mobile-${url.id}`)}
											class="text-secondary hover:text-bright cursor-pointer rounded p-1 hover:bg-slate-600/40"
											title="Copy original URL"
										>
											{#if copiedId === `url-mobile-${url.id}`}
												<CheckMark class="text-success h-4 w-4" />
											{:else}
												<Copy class="h-4 w-4" />
											{/if}
										</button>
									</div>
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
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- No URLs Message -->
	{#if urls.length === 0 && customUrls.length === 0}
		<div class="rounded-lg border border-slate-600/60 bg-slate-700/40 p-8 text-center backdrop-blur-lg">
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
