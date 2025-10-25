<script
	lang="ts"
	generics="T"
>
	import ArrowDown from "$lib/icons/arrow-down.icon.svelte";
	import ArrowUp from "$lib/icons/arrow-up.icon.svelte";
	import Loading from "$lib/icons/loading.icon.svelte";
	import type { PaginationMeta } from "$lib/services/api/url.api";
	import type { Snippet } from "svelte";

	type TableColumn<T> = {
		key: keyof T;
		label: string;
		sortable?: boolean;
		width?: string;
		hideOnMobile?: boolean;
	};

	type Props<T> = {
		columns: TableColumn<T>[];
		data: T[];
		pagination?: PaginationMeta;
		loading?: boolean;
		onSort?: (sortBy: string, sortOrder: "asc" | "desc") => void;
		onPageChange?: (page: number) => void;
		onLimitChange?: (limit: number) => void;
		emptyMessage?: string;
		keyField?: keyof T;
		cellContent?: Snippet<[T, TableColumn<T>]>;
		mobileCardContent?: Snippet<[T]>;
		headerContent?: Snippet;
		emptyState?: Snippet;
		showPagination?: boolean;
		defaultSortKey?: keyof T;
	};

	let {
		columns,
		data,
		pagination,
		loading = false,
		onSort,
		onPageChange,
		onLimitChange,
		emptyMessage = "No data found",
		keyField,
		cellContent,
		mobileCardContent,
		headerContent,
		emptyState,
		showPagination = true,
		defaultSortKey
	}: Props<T> = $props();

	const limitOptions = [10, 25, 50, 100];
	let sortKey = $state<keyof T | undefined>(defaultSortKey);
	let sortOrder = $state<PaginationMeta["sortOrder"]>("desc");

	function handleSort(key: keyof T) {
		if (sortKey === key) {
			if (sortOrder === "asc") sortOrder = "desc";
			else sortOrder = "asc";
		} else {
			sortKey = key;
			sortOrder = "asc";
		}
		onSort?.(String(key), sortOrder);
	}

	function generatePageNumbers(): (number | "...")[] {
		if (!pagination) return [];
		const { page, totalPages } = pagination;
		const pages: (number | "...")[] = [];

		if (totalPages <= 7) {
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			pages.push(1);

			if (page <= 4) {
				for (let i = 2; i <= 5; i++) {
					pages.push(i);
				}
				pages.push("...");
			} else if (page >= totalPages - 3) {
				pages.push("...");
				for (let i = totalPages - 4; i <= totalPages - 1; i++) {
					pages.push(i);
				}
			} else {
				pages.push("...");
				for (let i = page - 1; i <= page + 1; i++) {
					pages.push(i);
				}
				pages.push("...");
			}

			if (totalPages > 1) {
				pages.push(totalPages);
			}
		}

		return pages;
	}
</script>

<div class="space-y-4">
	<!-- Header Content -->
	{#if headerContent}
		<div>
			{@render headerContent()}
		</div>
	{/if}

	<div class="relative">
		{#if loading && data.length > 0}
			<!-- Loading overlay for existing data -->
			<div class="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-slate-700/50 backdrop-blur-xs">
				<Loading class="text-bright h-8 w-8" />
			</div>
		{/if}

		{#if loading && data.length === 0}
			<!-- Initial loading state -->
			<div class="flex justify-center py-8">
				<Loading class="text-bright h-8 w-8" />
			</div>
		{:else if data.length > 0}
			<!-- Desktop Table View -->
			<div
				class="hidden overflow-hidden rounded-lg border border-slate-600/60 bg-slate-700/40 backdrop-blur-lg md:block"
			>
				<table class="w-full table-fixed">
					<thead class="bg-slate-600/40">
						<tr>
							{#each columns as column (column.key)}
								<th class="text-body-small text-bright px-4 py-3 text-left font-medium {column.width || 'w-auto'}">
									{#if column.sortable && onSort}
										<button
											type="button"
											onclick={() => handleSort(column.key)}
											class="flex items-center space-x-1 transition-colors hover:text-slate-100"
										>
											<span>{column.label}</span>
											{#if sortKey === column.key}
												{#if sortOrder === "asc"}
													<ArrowUp class="h-4 w-4" />
												{:else}
													<ArrowDown class="h-4 w-4" />
												{/if}
											{:else}
												<div class="h-4 w-4 opacity-30">
													<ArrowDown class="h-4 w-4" />
												</div>
											{/if}
										</button>
									{:else}
										{column.label}
									{/if}
								</th>
							{/each}
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-600/30">
						{#each data as item, index (keyField ? item[keyField] : index)}
							<tr class="hover:bg-slate-600/20">
								{#each columns as column (column.key)}
									<td class="px-4 py-3">
										{#if cellContent}
											{@render cellContent(item, column)}
										{:else}
											{item[column.key]}
										{/if}
									</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- Mobile Card View -->
			<div class="block space-y-3 md:hidden">
				{#each data as item, index (keyField ? item[keyField] : index)}
					<div class="rounded-lg border border-slate-600/60 bg-slate-700/40 p-4 backdrop-blur-lg">
						{#if mobileCardContent}
							{@render mobileCardContent(item)}
						{:else}
							{#each columns as column (column.key)}
								{#if !column.hideOnMobile}
									<div class="mb-2 last:mb-0">
										<div class="text-body-small text-tertiary mb-1">{column.label}:</div>
										<div class="text-body-small text-bright">
											{#if cellContent}
												{@render cellContent(item, column)}
											{:else}
												{item[column.key]}
											{/if}
										</div>
									</div>
								{/if}
							{/each}
						{/if}
					</div>
				{/each}
			</div>
		{:else}
			<!-- Empty State -->
			{#if emptyState}
				{@render emptyState()}
			{:else}
				<div class="rounded-lg border border-slate-600/60 bg-slate-700/40 p-8 text-center backdrop-blur-lg">
					<p class="text-body text-secondary">{emptyMessage}</p>
				</div>
			{/if}
		{/if}
	</div>

	<!-- Pagination -->
	{#if pagination && showPagination && pagination.total > 0}
		<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
			<!-- Items per page -->
			<div class="flex items-center gap-2">
				<span class="text-body-small text-tertiary">Items per page:</span>
				<div class="hidden gap-1 md:flex">
					{#each limitOptions as limit (limit)}
						<button
							type="button"
							onclick={(e) => {
								e.preventDefault();
								onLimitChange?.(limit);
							}}
							class={`text-caption rounded px-3 py-1 transition-colors duration-200 ${
								pagination?.limit === limit
									? "text-bright bg-slate-600/60"
									: "text-secondary hover:text-bright hover:bg-slate-600/40"
							}`}
						>
							{limit}
						</button>
					{/each}
				</div>
				<select
					value={pagination?.limit}
					onchange={(e) => onLimitChange?.(Number(e.currentTarget.value))}
					class="text-body-small text-bright rounded border border-slate-600/60 bg-slate-800/40 px-2 py-1 md:hidden"
				>
					{#each limitOptions as limit (limit)}
						<option value={limit}>{limit}asd</option>
					{/each}
				</select>
			</div>

			<!-- Page Navigation -->
			{#if pagination.totalPages > 1}
				<div class="flex items-center gap-2">
					<button
						type="button"
						onclick={(e) => {
							e.preventDefault();
							onPageChange?.(pagination?.page - 1);
						}}
						disabled={!pagination?.hasPrev}
						class="text-caption text-secondary hover:text-bright disabled:hover:text-secondary rounded px-3 py-1 transition-colors duration-200 hover:bg-slate-600/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
					>
						Previous
					</button>

					<div class="flex gap-1">
						{#each generatePageNumbers() as pageNum (pageNum)}
							{#if pageNum === "..."}
								<span class="text-caption text-tertiary px-2 py-1">...</span>
							{:else}
								<button
									type="button"
									onclick={(e) => {
										e.preventDefault();
										onPageChange?.(pageNum);
									}}
									class={`text-caption rounded px-3 py-1 transition-colors duration-200 ${
										pagination?.page === pageNum
											? "text-bright bg-slate-600/60"
											: "text-secondary hover:text-bright hover:bg-slate-600/40"
									}`}
								>
									{pageNum}
								</button>
							{/if}
						{/each}
					</div>

					<button
						type="button"
						onclick={(e) => {
							e.preventDefault();
							onPageChange?.(pagination?.page + 1);
						}}
						disabled={!pagination?.hasNext}
						class="text-caption text-secondary hover:text-bright disabled:hover:text-secondary rounded px-3 py-1 transition-colors duration-200 hover:bg-slate-600/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
					>
						Next
					</button>
				</div>
			{/if}

			<!-- Page Info -->
			<div class="text-body-small text-tertiary text-center md:text-right">
				{#if pagination}
					Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(
						pagination.page * pagination.limit,
						pagination.total
					)} of {pagination.total} results
				{/if}
			</div>
		</div>
	{/if}
</div>
