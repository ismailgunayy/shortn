<script lang="ts">
	import { resolve } from "$app/paths";
	import CheckMark from "$lib/icons/check-mark.icon.svelte";
	import Copy from "$lib/icons/copy.icon.svelte";
	import Delete from "$lib/icons/delete.icon.svelte";
	import Edit from "$lib/icons/edit.icon.svelte";
	import Loading from "$lib/icons/loading.icon.svelte";
	import { clientApi } from "$lib/services/api/api.client";
	import type {
		CustomUrlItem,
		CustomUrlQueryParams,
		PaginationMeta,
		UrlItem,
		UrlQueryParams
	} from "$lib/services/api/url.api";
	import { toastService } from "$lib/services/toast.service";
	import { formatDate } from "$lib/utils/format-date.util";
	import { onMount } from "svelte";
	import Table from "../ui/table.svelte";
	import Close from "$lib/icons/close.icon.svelte";

	let loading = $state(true);
	let urlsLoading = $state(false);
	let customUrlsLoading = $state(false);
	let urls: UrlItem[] = $state([]);
	let customUrls: CustomUrlItem[] = $state([]);
	let urlsPagination: PaginationMeta = $state({} as PaginationMeta);
	let customUrlsPagination: PaginationMeta = $state({} as PaginationMeta);
	let copiedId: string | null = $state(null);
	let copiedTimeout: ReturnType<typeof setTimeout> | null = $state(null);
	let editingUrl: { id: number; originalUrl: string } | null = $state(null);
	let editOriginalUrl = $state("");
	let updatingUrl = $state(false);

	let urlsQuery: UrlQueryParams = $state({
		page: 1,
		limit: 10,
		sortBy: "createdAt",
		sortOrder: "desc"
	});

	let customUrlsQuery: CustomUrlQueryParams = $state({
		page: 1,
		limit: 10,
		sortBy: "createdAt",
		sortOrder: "desc"
	});

	const urlColumns = [
		{ key: "originalUrl" as keyof UrlItem, label: "Original URL", sortable: true, width: "w-6/12" },
		{ key: "shortCode" as keyof UrlItem, label: "Short Code", sortable: false, width: "w-3/12" },
		{ key: "createdAt" as keyof UrlItem, label: "Created Date", sortable: true, width: "w-2/12" },
		{ key: "id" as keyof UrlItem, label: "Delete", sortable: false, width: "w-1/12" }
	];

	const customUrlColumns = [
		{ key: "originalUrl" as keyof CustomUrlItem, label: "Original URL", sortable: true, width: "w-6/12" },
		{ key: "customCode" as keyof CustomUrlItem, label: "Custom Code", sortable: true, width: "w-3/12" },
		{ key: "createdAt" as keyof CustomUrlItem, label: "Created Date", sortable: true, width: "w-2/12" },
		{ key: "id" as keyof CustomUrlItem, label: "Actions", sortable: false, width: "w-1/12" }
	];

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		loading = true;

		const [generatedUrlsResponse, customUrlsResponse] = await Promise.all([
			clientApi.url.getGeneratedUrls(urlsQuery),
			clientApi.url.getCustomUrls(customUrlsQuery)
		]);

		if (generatedUrlsResponse.data) {
			urls = generatedUrlsResponse.data.urls;
			urlsPagination = generatedUrlsResponse.data.pagination;
		}

		if (customUrlsResponse.data) {
			customUrls = customUrlsResponse.data.customUrls;
			customUrlsPagination = customUrlsResponse.data.pagination;
		}

		loading = false;
	}

	async function copyToClipboard(text: string, id: string) {
		try {
			await navigator.clipboard.writeText(text);
			copiedId = id;
			if (copiedTimeout) clearTimeout(copiedTimeout);

			copiedTimeout = setTimeout(() => {
				copiedId = null;
			}, 2000);
		} catch {
			toastService.error("Failed to copy to clipboard.");
		}
	}

	async function updateCustomUrl() {
		if (!editingUrl || !editOriginalUrl.trim()) return;

		updatingUrl = true;

		const response = await clientApi.url.updateCustomUrl(editingUrl.id, {
			originalUrl: editOriginalUrl.trim()
		});

		const updatedUrl = response.data;

		if (updatedUrl) {
			customUrls = customUrls.map((url) => (url.id === updatedUrl.id ? updatedUrl : url));

			editingUrl = null;
			editOriginalUrl = "";
		}

		updatingUrl = false;
	}

	function startEditingUrl(url: CustomUrlItem) {
		editingUrl = { id: url.id, originalUrl: url.originalUrl };
		editOriginalUrl = url.originalUrl;
	}

	function cancelEditingUrl() {
		editingUrl = null;
		editOriginalUrl = "";
	}

	async function deleteUrl(id: number, shortenedUrl: string, isCustom = false) {
		const confirmed = confirm("Are you sure you want to delete this URL?");
		if (!confirmed) return;

		const response = await clientApi.url.deleteUrl(id, { shortenedUrl }, isCustom);

		if (response.success) {
			if (isCustom) {
				customUrls = customUrls.filter((url) => url.id !== id);
			} else {
				urls = urls.filter((url) => url.id !== id);
			}
		}
	}

	async function handleUrlSort(sortBy: string, sortOrder: "asc" | "desc") {
		urlsQuery.sortBy = sortBy as UrlQueryParams["sortBy"];
		urlsQuery.sortOrder = sortOrder;
		urlsQuery.page = 1;
		await loadUrlsData();
	}

	async function handleUrlPageChange(page: number) {
		urlsQuery.page = page;
		await loadUrlsData();
	}

	async function handleUrlLimitChange(limit: number) {
		urlsQuery.limit = limit;
		urlsQuery.page = 1;
		await loadUrlsData();
	}

	async function loadUrlsData() {
		urlsLoading = true;
		const response = await clientApi.url.getGeneratedUrls(urlsQuery);
		if (response.data) {
			urls = response.data.urls;
			urlsPagination = response.data.pagination;
		}
		urlsLoading = false;
	}

	async function handleCustomUrlSort(sortBy: string, sortOrder: "asc" | "desc") {
		customUrlsQuery.sortBy = sortBy as CustomUrlQueryParams["sortBy"];
		customUrlsQuery.sortOrder = sortOrder;
		customUrlsQuery.page = 1;
		await loadCustomUrlsData();
	}

	async function handleCustomUrlPageChange(page: number) {
		customUrlsQuery.page = page;
		await loadCustomUrlsData();
	}

	async function handleCustomUrlLimitChange(limit: number) {
		customUrlsQuery.limit = limit;
		customUrlsQuery.page = 1;
		await loadCustomUrlsData();
	}

	async function loadCustomUrlsData() {
		customUrlsLoading = true;
		const response = await clientApi.url.getCustomUrls(customUrlsQuery);
		if (response.data) {
			customUrls = response.data.customUrls;
			customUrlsPagination = response.data.pagination;
		}
		customUrlsLoading = false;
	}
</script>

<div class="space-y-6">
	<!-- Custom URLs -->
	{#if loading}
		<div class="flex justify-center">
			<Loading class="mt-8 h-12 w-12" />
		</div>
	{:else}
		<div class="mb-8">
			<h2 class="text-heading-3 text-bright mb-4 font-semibold">Custom URLs</h2>

			<Table
				loading={customUrlsLoading}
				data={customUrls}
				columns={customUrlColumns}
				pagination={customUrlsPagination}
				onSort={handleCustomUrlSort}
				onPageChange={handleCustomUrlPageChange}
				onLimitChange={handleCustomUrlLimitChange}
				defaultSortKey="createdAt"
				keyField="id"
			>
				{#snippet cellContent(item: CustomUrlItem, column: { key: keyof CustomUrlItem })}
					{#if column.key === "originalUrl"}
						{#if editingUrl?.id === item.id}
							<div class="flex items-center space-x-2">
								<input
									bind:value={editOriginalUrl}
									onkeydown={(e) => {
										if (e.key === "Enter") updateCustomUrl();
										if (e.key === "Escape") cancelEditingUrl();
									}}
									class="text-form-input flex-1 rounded-xl border border-slate-600/60 bg-slate-800/40 px-3 py-2 placeholder-slate-500 backdrop-blur-lg transition-all duration-200 focus:border-slate-500/80 focus:ring-2 focus:ring-slate-400/20 focus:outline-none"
									placeholder="Enter URL"
								/>
								<button
									type="button"
									onclick={updateCustomUrl}
									disabled={updatingUrl}
									class="text-caption text-success rounded bg-emerald-800/60 px-2 py-1 hover:bg-emerald-800/80 disabled:opacity-50"
									title="Save"
								>
									{#if updatingUrl}
										<Loading class="h-4 w-4" />
									{:else}
										<CheckMark class="h-4 w-4" />
									{/if}
								</button>
								<button
									type="button"
									onclick={cancelEditingUrl}
									class="text-caption text-secondary rounded bg-slate-600/60 px-2 py-1 hover:bg-slate-600/80"
									title="Cancel"
								>
									<Close class="h-4 w-4 text-red-400" />
								</button>
							</div>
						{:else}
							<div class="flex items-center gap-2">
								<div class="max-w-full overflow-x-auto">
									<span class="text-body-small text-bright whitespace-nowrap">{item.originalUrl}</span>
								</div>
								<button
									type="button"
									onclick={() => copyToClipboard(item.originalUrl, `custom-original-${item.id}`)}
									class="text-secondary hover:text-bright rounded p-1 hover:bg-slate-600/40"
									title="Copy original URL"
								>
									{#if copiedId === `custom-original-${item.id}`}
										<CheckMark class="text-success h-4 w-4" />
									{:else}
										<Copy class="h-4 w-4" />
									{/if}
								</button>
							</div>
						{/if}
					{:else if column.key === "customCode"}
						<div class="flex items-center gap-2">
							<span class="text-body-small text-bright whitespace-nowrap">{item.customCode}</span>
							<button
								type="button"
								onclick={() => copyToClipboard(item.shortenedUrl, `custom-${item.id}`)}
								class="text-secondary hover:text-bright rounded p-1 hover:bg-slate-600/40"
								title="Copy shortened URL"
							>
								{#if copiedId === `custom-${item.id}`}
									<CheckMark class="text-success h-4 w-4" />
								{:else}
									<Copy class="h-4 w-4" />
								{/if}
							</button>
						</div>
					{:else if column.key === "createdAt"}
						<span class="text-body-small text-tertiary">{formatDate(item.createdAt)}</span>
					{:else if column.key === "id"}
						{#if editingUrl?.id !== item.id}
							<div class="flex gap-1">
								<button
									type="button"
									onclick={() => startEditingUrl(item)}
									class="text-caption text-tertiary hover:text-secondary rounded px-2 py-1 hover:bg-slate-600/40"
									title="Edit original URL"
								>
									<Edit class="h-4 w-4" />
								</button>
								<button
									type="button"
									onclick={() => deleteUrl(item.id, item.shortenedUrl, true)}
									class="text-caption text-error rounded px-2 py-1 hover:bg-red-900/20 hover:text-red-300"
									title="Delete URL"
								>
									<Delete class="h-4 w-4" />
								</button>
							</div>
						{/if}
					{/if}
				{/snippet}

				{#snippet emptyState()}
					<div class="rounded-lg border border-slate-600/60 bg-slate-700/40 p-8 text-center backdrop-blur-lg">
						<p class="text-body text-secondary mb-2">No custom URLs yet</p>
						<p class="text-body-small text-muted">Start by creating your first custom URL!</p>
						<a
							href={resolve("/")}
							class="text-button-small text-button-color mt-4 inline-block rounded-lg bg-slate-600/60 px-4 py-2 hover:bg-slate-600/80"
						>
							Create URL
						</a>
					</div>
				{/snippet}
			</Table>
		</div>

		<!-- Generated URLs -->
		<div>
			<h2 class="text-heading-3 text-bright mb-4 font-semibold">Generated URLs</h2>

			<Table
				loading={urlsLoading}
				data={urls}
				columns={urlColumns}
				pagination={urlsPagination}
				onSort={handleUrlSort}
				onPageChange={handleUrlPageChange}
				onLimitChange={handleUrlLimitChange}
				defaultSortKey="createdAt"
				keyField="id"
			>
				{#snippet cellContent(item: UrlItem, column: { key: keyof UrlItem })}
					{#if column.key === "originalUrl"}
						<div class="flex items-center gap-2">
							<div class="max-w-full overflow-x-auto">
								<span class="text-body-small text-bright whitespace-nowrap">{item.originalUrl}</span>
							</div>
							<button
								type="button"
								onclick={() => copyToClipboard(item.originalUrl, `url-original-${item.id}`)}
								class="text-secondary hover:text-bright rounded p-1 hover:bg-slate-600/40"
								title="Copy original URL"
							>
								{#if copiedId === `url-original-${item.id}`}
									<CheckMark class="text-success h-4 w-4" />
								{:else}
									<Copy class="h-4 w-4" />
								{/if}
							</button>
						</div>
					{:else if column.key === "shortCode"}
						<div class="flex items-center gap-2">
							<span class="text-body-small text-bright whitespace-nowrap">{item.shortCode}</span>
							<button
								type="button"
								onclick={() => copyToClipboard(item.shortenedUrl, `url-${item.id}`)}
								class="text-secondary hover:text-bright rounded p-1 hover:bg-slate-600/40"
								title="Copy shortened URL"
							>
								{#if copiedId === `url-${item.id}`}
									<CheckMark class="text-success h-4 w-4" />
								{:else}
									<Copy class="h-4 w-4" />
								{/if}
							</button>
						</div>
					{:else if column.key === "createdAt"}
						<span class="text-body-small text-tertiary">{formatDate(item.createdAt)}</span>
					{:else if column.key === "id"}
						<button
							type="button"
							onclick={() => deleteUrl(item.id, item.shortenedUrl, false)}
							class="text-caption text-error rounded px-2 py-1 hover:bg-red-900/20 hover:text-red-300"
							title="Delete URL"
						>
							<Delete class="h-4 w-4" />
						</button>
					{/if}
				{/snippet}

				{#snippet emptyState()}
					<div class="rounded-lg border border-slate-600/60 bg-slate-700/40 p-8 text-center backdrop-blur-lg">
						<p class="text-body text-secondary mb-2">No URLs yet</p>
						<p class="text-body-small text-muted">Start by creating your first short URL!</p>
						<a
							href={resolve("/")}
							class="text-button-small text-button-color mt-4 inline-block rounded-lg bg-slate-600/60 px-4 py-2 hover:bg-slate-600/80"
						>
							Create URL
						</a>
					</div>
				{/snippet}
			</Table>
		</div>
	{/if}
</div>
