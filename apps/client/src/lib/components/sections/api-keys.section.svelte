<script lang="ts">
	import Loading from "$lib/icons/loading.icon.svelte";

	import CheckMark from "$lib/icons/check-mark.icon.svelte";
	import Copy from "$lib/icons/copy.icon.svelte";
	import Delete from "$lib/icons/delete.icon.svelte";
	import Edit from "$lib/icons/edit.icon.svelte";
	import Key from "$lib/icons/key.icon.svelte";
	import Plus from "$lib/icons/plus.icon.svelte";
	import { clientApi } from "$lib/services/api/api.client";
	import type { ApiKey, CreateApiKeyResponse } from "$lib/services/api/auth.api";
	import { toastService } from "$lib/services/toast.service";
	import { formatDate } from "$lib/utils/format-date.util";
	import { onMount } from "svelte";
	import Table from "../ui/table.svelte";
	import Close from "$lib/icons/close.icon.svelte";

	let loading = $state(true);
	let apiKeys: ApiKey[] = $state([]);
	let newApiKeyName = $state("");
	let creatingApiKey = $state(false);
	let newApiKey: CreateApiKeyResponse | null = $state(null);
	let copiedId: string | null = $state(null);

	let editingApiKey: { id: number; name: string } | null = $state(null);
	let editApiKeyName = $state("");
	let updatingApiKey = $state(false);

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		loading = true;

		const response = await clientApi.auth.getApiKeys();

		if (response.data) {
			apiKeys = response.data.apiKeys;
		}

		loading = false;
	}

	async function createApiKey() {
		creatingApiKey = true;

		const response = await clientApi.auth.createApiKey({ name: newApiKeyName.trim() });

		if (response.data) {
			newApiKey = response.data;

			apiKeys = [
				...apiKeys,
				{
					id: response.data.id,
					name: response.data.name,
					lastFour: response.data.lastFour,
					createdAt: new Date().toString(),
					lastUsedAt: new Date().toString()
				}
			];
			newApiKeyName = "";
		}

		creatingApiKey = false;
	}

	async function updateApiKey() {
		if (!editingApiKey || !editApiKeyName.trim()) return;

		updatingApiKey = true;

		const response = await clientApi.auth.updateApiKey(editingApiKey.id, {
			name: editApiKeyName.trim()
		});

		if (response.data) {
			apiKeys = apiKeys.map((key) => (key.id === editingApiKey?.id ? { ...key, name: response.data!.name } : key));

			editingApiKey = null;
			editApiKeyName = "";
		}

		updatingApiKey = false;
	}

	async function deleteApiKey(id: number, name: string) {
		const confirmed = confirm(`Are you sure you want to delete the API key "${name}"?`);
		if (!confirmed) return;

		const response = await clientApi.auth.deleteApiKey(id);

		if (response.success) {
			apiKeys = apiKeys.filter((key) => key.id !== id);
		}
	}

	async function copyToClipboard(text: string, id: string) {
		try {
			await navigator.clipboard.writeText(text);
			copiedId = id;
			setTimeout(() => {
				copiedId = null;
			}, 2000);
		} catch {
			toastService.error("Failed to copy to clipboard.");
		}
	}

	function startEditingApiKey(apiKey: ApiKey) {
		editingApiKey = { id: apiKey.id, name: apiKey.name };
		editApiKeyName = apiKey.name;
	}

	function cancelEditingApiKey() {
		editingApiKey = null;
		editApiKeyName = "";
	}

	const apiKeyColumns = [
		{ key: "name" as keyof ApiKey, label: "Name", width: "w-4/12" },
		{ key: "lastFour" as keyof ApiKey, label: "Key", width: "w-2/12" },
		{ key: "createdAt" as keyof ApiKey, label: "Created", width: "w-2/12" },
		{ key: "lastUsedAt" as keyof ApiKey, label: "Last Used", width: "w-2/12" },
		{ key: "id" as keyof ApiKey, label: "Actions", width: "w-1/12" }
	];
</script>

<div class="space-y-6">
	{#if loading}
		<div class="flex justify-center">
			<Loading class="mt-8 h-12 w-12" />
		</div>
	{:else}
		<!-- API Keys List -->
		<div>
			<Table
				data={apiKeys}
				columns={apiKeyColumns}
				showPagination={false}
				keyField="id"
			>
				{#snippet headerContent()}
					<div class="mb-6 flex items-center justify-between">
						<h2 class="text-heading-3 text-bright font-semibold">API Keys</h2>
						<div class="flex items-center gap-3">
							<input
								bind:value={newApiKeyName}
								placeholder="Key name..."
								class="text-form-input rounded-lg border border-slate-600/60 bg-slate-800/40 px-3 py-2 text-sm placeholder-slate-500 transition-all focus:border-slate-500/80 focus:ring-2 focus:ring-slate-400/20 focus:outline-none"
								onkeydown={(e) => e.key === "Enter" && createApiKey()}
							/>
							<button
								type="button"
								onclick={createApiKey}
								disabled={creatingApiKey || !newApiKeyName.trim()}
								class="text-button-small text-button-color flex items-center gap-2 rounded-lg bg-slate-600/60 py-2 pr-4 pl-3 transition-all hover:bg-slate-600/80 disabled:opacity-50"
							>
								{#if creatingApiKey}
									<Loading class="h-4 w-4" />
								{:else}
									<Plus class="h-4 w-4" />
								{/if}
								Create
							</button>
						</div>
					</div>
				{/snippet}

				{#snippet cellContent(item: ApiKey, column: { key: keyof ApiKey })}
					{#if column.key === "name"}
						{#if editingApiKey?.id === item.id}
							<div class="flex items-center gap-2">
								<input
									bind:value={editApiKeyName}
									onkeydown={(e) => {
										if (e.key === "Enter") updateApiKey();
										if (e.key === "Escape") cancelEditingApiKey();
									}}
									class="text-form-input flex-1 rounded-xl border border-slate-600/60 bg-slate-800/40 px-3 py-2 placeholder-slate-500 backdrop-blur-lg transition-all duration-200 focus:border-slate-500/80 focus:ring-2 focus:ring-slate-400/20 focus:outline-none"
									placeholder="API Key Name"
								/>
								<button
									type="button"
									onclick={updateApiKey}
									disabled={updatingApiKey || !editApiKeyName.trim()}
									class="text-caption text-success rounded bg-emerald-800/60 px-2 py-1 hover:bg-emerald-800/80 disabled:opacity-50"
									title="Save"
								>
									{#if updatingApiKey}
										<Loading class="h-4 w-4" />
									{:else}
										<CheckMark class="h-4 w-4" />
									{/if}
								</button>
								<button
									type="button"
									onclick={cancelEditingApiKey}
									class="text-caption text-secondary rounded bg-slate-600/60 px-2 py-1 hover:bg-slate-600/80"
									title="Cancel"
								>
									<Close class="h-4 w-4 text-red-400" />
								</button>
							</div>
						{:else}
							<span class="text-body-small text-bright font-medium">{item.name}</span>
						{/if}
					{:else if column.key === "lastFour"}
						<div class="flex items-center gap-2">
							<span class="text-body-small text-bright font-medium whitespace-nowrap">********{item.lastFour}</span>
							{#if copiedId === `api-key-${item.id}`}
								<CheckMark class="text-success h-4 w-4" />
							{/if}
						</div>
					{:else if column.key === "createdAt"}
						<span class="text-body-small text-tertiary">{formatDate(item.createdAt)}</span>
					{:else if column.key === "lastUsedAt"}
						<span class="text-body-small text-tertiary">{formatDate(item.lastUsedAt)}</span>
					{:else if column.key === "id"}
						{#if editingApiKey?.id !== item.id}
							<div class="flex gap-1">
								<button
									type="button"
									onclick={() => startEditingApiKey(item)}
									class="text-caption text-tertiary hover:text-secondary rounded px-2 py-1 hover:bg-slate-600/40"
									title="Edit API key name"
								>
									<Edit class="h-4 w-4" />
								</button>
								<button
									type="button"
									onclick={() => deleteApiKey(item.id, item.name)}
									class="text-caption text-error rounded px-2 py-1 hover:bg-red-900/20 hover:text-red-300"
									title="Delete API key"
								>
									<Delete class="h-4 w-4" />
								</button>
							</div>
						{/if}
					{/if}
				{/snippet}

				{#snippet mobileCardContent(item: ApiKey)}
					{#if editingApiKey?.id === item.id}
						<div class="space-y-3">
							<div class="flex items-center gap-2">
								<Key class="text-tertiary h-4 w-4" />
								<span class="text-body-small text-secondary">Editing API Key</span>
							</div>
							<div class="flex items-center gap-2">
								<input
									bind:value={editApiKeyName}
									onkeydown={(e) => {
										if (e.key === "Enter") updateApiKey();
										if (e.key === "Escape") cancelEditingApiKey();
									}}
									class="text-form-input flex-1 rounded-xl border border-slate-600/60 bg-slate-800/40 px-3 py-2 placeholder-slate-500 backdrop-blur-lg transition-all duration-200 focus:border-slate-500/80 focus:ring-2 focus:ring-slate-400/20 focus:outline-none"
									placeholder="API Key Name"
								/>
								<button
									type="button"
									onclick={updateApiKey}
									disabled={updatingApiKey || !editApiKeyName.trim()}
									class="text-caption text-success rounded bg-emerald-800/60 px-2 py-1 hover:bg-emerald-800/80 disabled:opacity-50"
								>
									{#if updatingApiKey}
										<Loading class="h-3 w-3" />
									{:else}
										Save
									{/if}
								</button>
								<button
									type="button"
									onclick={cancelEditingApiKey}
									class="text-caption text-secondary rounded bg-slate-600/60 px-2 py-1 hover:bg-slate-600/80"
								>
									Cancel
								</button>
							</div>
						</div>
					{:else}
						<div class="flex items-start justify-between gap-4">
							<div class="min-w-0 flex-1">
								<div class="mb-2 flex items-center gap-2">
									<span class="text-body-small text-bright font-medium">{item.name}</span>
								</div>
								<div class="mb-2 flex items-center gap-2">
									<span class="text-body-small text-bright font-mono whitespace-nowrap">****{item.lastFour}</span>
								</div>
								<div class="space-y-1">
									<p class="text-caption text-muted">Created {formatDate(item.createdAt)}</p>
									<p class="text-caption text-muted">Last used {formatDate(item.lastUsedAt)}</p>
								</div>
							</div>
							<div class="flex gap-2">
								<button
									type="button"
									onclick={() => startEditingApiKey(item)}
									class="text-caption text-tertiary hover:text-secondary rounded px-2 py-1 hover:bg-slate-600/40"
									title="Edit API key name"
								>
									<Edit class="h-4 w-4" />
								</button>
								<button
									type="button"
									onclick={() => deleteApiKey(item.id, item.name)}
									class="text-caption text-error rounded px-2 py-1 hover:bg-red-900/20 hover:text-red-300"
									title="Delete API key"
								>
									<Delete class="h-4 w-4" />
								</button>
							</div>
						</div>
					{/if}
				{/snippet}

				{#snippet emptyState()}
					<div class="rounded-lg border border-slate-600/60 bg-slate-700/40 p-8 text-center backdrop-blur-lg">
						<Key class="text-muted mx-auto mb-4 h-8 w-8" />
						<p class="text-body text-secondary mb-2">No API Keys yet</p>
						<p class="text-body-small text-muted">Create your first API key to get started with programmatic access!</p>
					</div>
				{/snippet}
			</Table>
		</div>
	{/if}
</div>

<!-- API Key Created Modal -->
{#if newApiKey}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		onclick={(e) => e.target === e.currentTarget && (newApiKey = null)}
		onkeydown={(e) => e.key === "Escape" && (newApiKey = null)}
	>
		<div class="w-full max-w-md rounded-xl border border-slate-600/60 bg-slate-700/40 p-6 backdrop-blur-lg">
			<div class="space-y-4">
				<div>
					<span class="text-caption text-muted font-medium">Key Name</span>
					<p class="text-body text-bright font-medium">{newApiKey.name}</p>
				</div>

				<div class="flex flex-col">
					<span class="text-caption text-muted font-medium">API Key</span>
					<div class="mt-1 flex items-center gap-2">
						<code
							class="text-body-small text-success flex-1 overflow-x-auto rounded border border-slate-600/40 bg-slate-900/60 px-3 py-2 font-mono"
						>
							{newApiKey.key}
						</code>
						<button
							type="button"
							onclick={() => copyToClipboard(newApiKey!.key, "modal-api-key")}
							class="text-button-small text-secondary hover:text-bright rounded bg-slate-600/60 px-3 py-2 hover:bg-slate-600/80"
							title="Copy to clipboard"
						>
							{#if copiedId === "modal-api-key"}
								<CheckMark class="text-success h-4 w-4" />
							{:else}
								<Copy class="h-4 w-4" />
							{/if}
						</button>
					</div>
				</div>

				<div class="rounded-lg border border-amber-800/50 bg-amber-900/20 p-3">
					<p class="text-caption text-warning">⚠️ Save this key immediately - it won't be shown again</p>
				</div>
			</div>

			<button
				type="button"
				onclick={() => {
					newApiKey = null;
					newApiKeyName = "";
				}}
				class="text-button text-button-color mt-6 w-full rounded-lg bg-slate-600/60 px-4 py-2.5 hover:bg-slate-600/80"
			>
				Done
			</button>
		</div>
	</div>
{/if}
