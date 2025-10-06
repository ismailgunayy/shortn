<script lang="ts">
	import { api } from "$lib/api/api.client";
	import Loading from "$lib/icons/Loading.svelte";
	import Copy from "$lib/icons/Copy.svelte";
	import Edit from "$lib/icons/Edit.svelte";
	import Delete from "$lib/icons/Delete.svelte";
	import CheckMark from "$lib/icons/CheckMark.svelte";
	import Key from "$lib/icons/Key.svelte";
	import Plus from "$lib/icons/Plus.svelte";
	import { formatDate } from "$lib/utils/formatDate";
	import type { ApiKey } from "$lib/api/services/auth.service";

	interface Props {
		apiKeys: ApiKey[];
		onApiKeysUpdated: (apiKeys: ApiKey[]) => void;
	}

	let { apiKeys, onApiKeysUpdated }: Props = $props();

	let newApiKeyName = $state("");
	let creatingApiKey = $state(false);
	let newApiKeyResult: { key: string; name: string; id: number } | null = $state(null);
	let copiedId: string | null = $state(null);

	// Edit state
	let editingApiKey: { id: number; name: string } | null = $state(null);
	let editApiKeyName = $state("");
	let updatingApiKey = $state(false);

	async function createApiKey() {
		if (!newApiKeyName.trim()) return;

		creatingApiKey = true;

		try {
			const response = await api.auth.createApiKey({ name: newApiKeyName.trim() });

			if (response.error) {
				throw new Error(response.error.message);
			}

			if (response.data) {
				newApiKeyResult = response.data;
				onApiKeysUpdated([
					...apiKeys,
					{
						id: response.data.id,
						name: response.data.name,
						lastFour: response.data.lastFour,
						createdAt: new Date().toString(),
						lastUsedAt: new Date().toString()
					}
				]);
				newApiKeyName = "";
			}
		} catch (err) {
			alert(err instanceof Error ? err.message : "Failed to create API key");
		} finally {
			creatingApiKey = false;
		}
	}

	async function updateApiKey() {
		if (!editingApiKey || !editApiKeyName.trim()) return;

		updatingApiKey = true;

		try {
			const response = await api.auth.updateApiKey(editingApiKey.id, {
				name: editApiKeyName.trim()
			});

			if (response.error) {
				throw new Error(response.error.message);
			}

			if (response.data) {
				const updatedApiKeys = apiKeys.map((key) =>
					key.id === editingApiKey!.id ? { ...key, name: response.data!.name } : key
				);
				onApiKeysUpdated(updatedApiKeys);
				editingApiKey = null;
				editApiKeyName = "";
			}
		} catch (err) {
			alert(err instanceof Error ? err.message : "Failed to update API key");
		} finally {
			updatingApiKey = false;
		}
	}

	async function deleteApiKey(id: number, name: string) {
		if (!confirm(`Are you sure you want to delete the API key "${name}"?`)) return;

		try {
			const response = await api.auth.deleteApiKey(id);

			if (response.error) {
				throw new Error(response.error.message);
			}

			const updatedApiKeys = apiKeys.filter((key) => key.id !== id);
			onApiKeysUpdated(updatedApiKeys);
		} catch (err) {
			alert(err instanceof Error ? err.message : "Failed to delete API key");
		}
	}

	async function copyToClipboard(text: string, id: string) {
		try {
			await navigator.clipboard.writeText(text);
			copiedId = id;
			setTimeout(() => {
				copiedId = null;
			}, 2000);
		} catch (err) {
			console.error("Failed to copy:", err);
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
</script>

<div class="space-y-6">
	<!-- API Keys List -->
	<div>
		<div class="mb-6 flex items-center justify-between">
			<h2 class="text-heading-3 text-bright font-semibold">API Keys</h2>
			<div class="flex items-center gap-3">
				<input
					bind:value={newApiKeyName}
					placeholder="Key name..."
					class="text-form-input rounded-lg border border-slate-600/60 bg-slate-800/40 px-3 py-2 text-sm placeholder-slate-500 transition-all focus:border-slate-500/80 focus:outline-none focus:ring-2 focus:ring-slate-400/20"
					onkeydown={(e) => e.key === "Enter" && createApiKey()}
				/>
				<button
					onclick={createApiKey}
					disabled={creatingApiKey || !newApiKeyName.trim()}
					class="text-button-small text-button-color flex cursor-pointer items-center gap-2 rounded-lg bg-slate-600/60 py-2 pl-3 pr-4 transition-all hover:bg-slate-600/80 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{#if creatingApiKey}
						<Loading class="h-4 w-4" />
						Creating...
					{:else}
						<Plus class="h-4 w-4" />
						Create
					{/if}
				</button>
			</div>
		</div>

		{#if apiKeys.length > 0}
			<!-- Desktop Table View -->
			<div
				class="hidden overflow-hidden rounded-lg border border-slate-600/60 bg-slate-700/40 backdrop-blur-lg md:block"
			>
				<table class="w-full table-fixed">
					<thead class="bg-slate-600/40">
						<tr>
							<th class="text-body-small text-bright w-4/12 px-4 py-3 text-left font-medium">
								<div class="flex items-center gap-2">
									<Key class="h-4 w-4" />
									Name
								</div>
							</th>
							<th class="text-body-small text-bright w-2/12 px-4 py-3 text-left font-medium">Key</th>
							<th class="text-body-small text-bright w-2/12 px-4 py-3 text-left font-medium">Created</th>
							<th class="text-body-small text-bright w-2/12 px-4 py-3 text-left font-medium">Last Used</th>
							<th class="text-body-small text-bright w-1/12 px-4 py-3 text-left font-medium">Actions</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-600/30">
						{#each apiKeys as apiKey}
							<tr class="hover:bg-slate-600/20">
								<td class="px-4 py-3">
									{#if editingApiKey?.id === apiKey.id}
										<div class="flex items-center gap-2">
											<input
												bind:value={editApiKeyName}
												class="text-form-input flex-1 rounded-xl border border-slate-600/60 bg-slate-800/40 px-3 py-2 placeholder-slate-500 backdrop-blur-lg transition-all duration-200 focus:border-slate-500/80 focus:outline-none focus:ring-2 focus:ring-slate-400/20"
												placeholder="API Key Name"
											/>
											<button
												onclick={updateApiKey}
												disabled={updatingApiKey || !editApiKeyName.trim()}
												class="text-caption text-success cursor-pointer rounded bg-emerald-800/60 px-2 py-1 hover:bg-emerald-800/80 disabled:opacity-50"
											>
												{#if updatingApiKey}
													<Loading class="h-3 w-3" />
												{:else}
													Save
												{/if}
											</button>
											<button
												onclick={cancelEditingApiKey}
												class="text-caption text-secondary cursor-pointer rounded bg-slate-600/60 px-2 py-1 hover:bg-slate-600/80"
											>
												Cancel
											</button>
										</div>
									{:else}
										<span class="text-body-small text-bright font-medium">{apiKey.name}</span>
									{/if}
								</td>
								<td class="px-4 py-3">
									<div class="flex items-center gap-2">
										<span class="text-body-small text-bright whitespace-nowrap font-medium"
											>********{apiKey.lastFour}</span
										>
										{#if copiedId === `api-key-${apiKey.id}`}
											<CheckMark class="text-success h-4 w-4" />
										{/if}
									</div>
								</td>
								<td class="px-4 py-3">
									<span class="text-body-small text-tertiary">{formatDate(apiKey.createdAt)}</span>
								</td>
								<td class="px-4 py-3">
									<span class="text-body-small text-tertiary">{formatDate(apiKey.lastUsedAt)}</span>
								</td>
								<td class="px-4 py-3">
									{#if editingApiKey?.id !== apiKey.id}
										<div class="flex gap-1">
											<button
												onclick={() => startEditingApiKey(apiKey)}
												class="text-caption text-tertiary hover:text-secondary cursor-pointer rounded px-2 py-1 hover:bg-slate-600/40"
												title="Edit API key name"
											>
												<Edit class="h-4 w-4" />
											</button>
											<button
												onclick={() => deleteApiKey(apiKey.id, apiKey.name)}
												class="text-caption text-error cursor-pointer rounded px-2 py-1 hover:bg-red-900/20 hover:text-red-300"
												title="Delete API key"
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
				{#each apiKeys as apiKey}
					<div class="relative">
						<div class="rounded-lg border border-slate-600/60 bg-slate-700/40 p-4 backdrop-blur-lg">
							{#if editingApiKey?.id === apiKey.id}
								<div class="space-y-3">
									<div class="flex items-center gap-2">
										<Key class="text-tertiary h-4 w-4" />
										<span class="text-body-small text-secondary">Editing API Key</span>
									</div>
									<div class="flex items-center gap-2">
										<input
											bind:value={editApiKeyName}
											class="text-form-input flex-1 rounded-xl border border-slate-600/60 bg-slate-800/40 px-3 py-2 placeholder-slate-500 backdrop-blur-lg transition-all duration-200 focus:border-slate-500/80 focus:outline-none focus:ring-2 focus:ring-slate-400/20"
											placeholder="API Key Name"
										/>
										<button
											onclick={updateApiKey}
											disabled={updatingApiKey || !editApiKeyName.trim()}
											class="text-caption text-success cursor-pointer rounded bg-emerald-800/60 px-2 py-1 hover:bg-emerald-800/80 disabled:opacity-50"
										>
											{#if updatingApiKey}
												<Loading class="h-3 w-3" />
											{:else}
												Save
											{/if}
										</button>
										<button
											onclick={cancelEditingApiKey}
											class="text-caption text-secondary cursor-pointer rounded bg-slate-600/60 px-2 py-1 hover:bg-slate-600/80"
										>
											Cancel
										</button>
									</div>
								</div>
							{:else}
								<div class="flex items-start justify-between gap-4">
									<div class="min-w-0 flex-1">
										<div class="mb-2 flex items-center gap-2">
											<Key class="text-tertiary h-4 w-4" />
											<span class="text-body-small text-bright font-medium">{apiKey.name}</span>
										</div>
										<div class="mb-2 flex items-center gap-2">
											<span class="text-body-small text-bright whitespace-nowrap font-mono">****{apiKey.lastFour}</span>
											<button
												onclick={() => copyToClipboard(`****${apiKey.lastFour}`, `api-key-mobile-${apiKey.id}`)}
												class="text-secondary hover:text-bright cursor-pointer rounded p-1 hover:bg-slate-600/40"
												title="Copy partial key"
											>
												{#if copiedId === `api-key-mobile-${apiKey.id}`}
													<CheckMark class="text-success h-4 w-4" />
												{:else}
													<Copy class="h-4 w-4" />
												{/if}
											</button>
										</div>
										<div class="space-y-1">
											<p class="text-caption text-muted">Created {formatDate(apiKey.createdAt)}</p>
											<p class="text-caption text-muted">
												Last used {formatDate(apiKey.lastUsedAt)}
											</p>
										</div>
									</div>
									<div class="flex gap-2">
										<button
											onclick={() => startEditingApiKey(apiKey)}
											class="text-caption text-tertiary hover:text-secondary cursor-pointer rounded px-2 py-1 hover:bg-slate-600/40"
											title="Edit API key name"
										>
											<Edit class="h-4 w-4" />
										</button>
										<button
											onclick={() => deleteApiKey(apiKey.id, apiKey.name)}
											class="text-caption text-error cursor-pointer rounded px-2 py-1 hover:bg-red-900/20 hover:text-red-300"
											title="Delete API key"
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
		{:else}
			<div class="rounded-lg border border-slate-600/60 bg-slate-700/40 p-8 text-center backdrop-blur-lg">
				<Key class="text-muted mx-auto mb-4 h-8 w-8" />
				<p class="text-body text-secondary mb-2">No API Keys yet</p>
				<p class="text-body-small text-muted">Create your first API key to get started with programmatic access!</p>
			</div>
		{/if}
	</div>
</div>

<!-- API Key Created Modal -->
{#if newApiKeyResult}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		onclick={(e) => e.target === e.currentTarget && (newApiKeyResult = null)}
		onkeydown={(e) => e.key === "Escape" && (newApiKeyResult = null)}
	>
		<div class="w-full max-w-md rounded-xl border border-slate-600/60 bg-slate-700/40 p-6 backdrop-blur-lg">
			<div class="space-y-4">
				<div>
					<span class="text-caption text-muted font-medium">Key Name</span>
					<p class="text-body text-bright font-medium">{newApiKeyResult.name}</p>
				</div>

				<div class="flex flex-col">
					<span class="text-caption text-muted font-medium">API Key</span>
					<div class="mt-1 flex items-center gap-2">
						<code
							class="text-body-small text-success flex-1 overflow-x-auto rounded border border-slate-600/40 bg-slate-900/60 px-3 py-2 font-mono"
						>
							{newApiKeyResult.key}
						</code>
						<button
							onclick={() => copyToClipboard(newApiKeyResult!.key, "modal-api-key")}
							class="text-button-small text-secondary hover:text-bright cursor-pointer rounded bg-slate-600/60 px-3 py-2 hover:bg-slate-600/80"
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
				onclick={() => {
					newApiKeyResult = null;
					newApiKeyName = "";
				}}
				class="text-button text-button-color mt-6 w-full cursor-pointer rounded-lg bg-slate-600/60 px-4 py-2.5 hover:bg-slate-600/80"
			>
				Done
			</button>
		</div>
	</div>
{/if}
