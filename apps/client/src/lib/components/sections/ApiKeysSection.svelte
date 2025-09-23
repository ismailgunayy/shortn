<script lang="ts">
	import type { ApiKeyItem } from '$lib/types/api.types';
	import { api } from '$lib/api/api.client';
	import Loading from '$lib/icons/Loading.svelte';
	import Copy from '$lib/icons/Copy.svelte';
	import Edit from '$lib/icons/Edit.svelte';
	import Delete from '$lib/icons/Delete.svelte';

	interface Props {
		apiKeys: ApiKeyItem[];
		onApiKeysUpdated: (apiKeys: ApiKeyItem[]) => void;
	}

	let { apiKeys, onApiKeysUpdated }: Props = $props();

	let newApiKeyName = $state('');
	let creatingApiKey = $state(false);
	let newApiKeyResult: { key: string; name: string; id: number } | null = $state(null);

	// Edit state
	let editingApiKey: { id: number; name: string } | null = $state(null);
	let editApiKeyName = $state('');
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
				const updatedApiKeys = [
					...apiKeys,
					{
						id: response.data.id,
						name: response.data.name,
						lastFour: response.data.lastFour,
						createdAt: new Date().toISOString(),
						lastUsedAt: new Date().toISOString()
					}
				];
				onApiKeysUpdated(updatedApiKeys);
				newApiKeyName = '';
			}
		} catch (err) {
			alert(err instanceof Error ? err.message : 'Failed to create API key');
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
				editApiKeyName = '';
			}
		} catch (err) {
			alert(err instanceof Error ? err.message : 'Failed to update API key');
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
			alert(err instanceof Error ? err.message : 'Failed to delete API key');
		}
	}

	async function copyToClipboard(text: string) {
		try {
			await navigator.clipboard.writeText(text);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	}

	function startEditingApiKey(apiKey: ApiKeyItem) {
		editingApiKey = { id: apiKey.id, name: apiKey.name };
		editApiKeyName = apiKey.name;
	}

	function cancelEditingApiKey() {
		editingApiKey = null;
		editApiKeyName = '';
	}
</script>

<div class="space-y-6">
	<!-- Create New API Key -->
	<div class="rounded-lg border border-slate-600/60 bg-slate-700/40 p-6 backdrop-blur-lg">
		<h3 class="text-heading-3 text-bright mb-4 font-semibold">Create New API Key</h3>

		{#if newApiKeyResult}
			<div class="mb-6 rounded-lg border border-emerald-800/50 bg-emerald-900/20 p-4">
				<p class="text-body-small text-success mb-2 font-medium">API Key Created!</p>
				<p class="text-caption mb-2 text-emerald-400">Save this key - it won't be shown again:</p>
				<div class="flex items-center gap-2">
					<code
						class="text-caption flex-1 rounded bg-slate-900/60 px-2 py-1 font-mono text-emerald-200"
					>
						{newApiKeyResult.key}
					</code>
					<button
						onclick={() => copyToClipboard(newApiKeyResult!.key)}
						class="text-caption flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-emerald-400 hover:bg-emerald-800/20"
					>
						<Copy class="h-3 w-3" />
					</button>
				</div>
			</div>
		{:else}
			<div class="flex gap-2">
				<input
					bind:value={newApiKeyName}
					placeholder="API Key Name"
					class="text-input text-form-input text-form-placeholder flex-1 rounded border border-slate-600 bg-slate-800 px-3 py-2 focus:border-slate-500 focus:outline-none"
					onkeydown={(e) => e.key === 'Enter' && createApiKey()}
				/>
				<button
					onclick={createApiKey}
					disabled={creatingApiKey || !newApiKeyName.trim()}
					class="text-button-small text-button-color disabled:text-button-disabled cursor-pointer rounded bg-slate-600/60 px-4 py-2 hover:bg-slate-600/80 disabled:opacity-50"
				>
					{#if creatingApiKey}
						<Loading class="h-4 w-4" />
					{:else}
						Create
					{/if}
				</button>
			</div>
		{/if}
	</div>

	<!-- API Keys List -->
	{#if apiKeys.length > 0}
		<div>
			<h3 class="text-heading-3 text-bright mb-4 font-semibold">Your API Keys</h3>
			<div class="space-y-3">
				{#each apiKeys as apiKey}
					<div class="rounded-lg border border-slate-600/60 bg-slate-700/40 p-4 backdrop-blur-lg">
						{#if editingApiKey?.id === apiKey.id}
							<div class="flex flex-1 items-center gap-2">
								<input
									bind:value={editApiKeyName}
									class="text-input text-form-input text-form-placeholder flex-1 rounded border border-slate-600 bg-slate-800 px-2 py-1 focus:border-slate-500 focus:outline-none"
									placeholder="API Key Name"
								/>
								<button
									onclick={updateApiKey}
									disabled={updatingApiKey || !editApiKeyName.trim()}
									class="text-caption cursor-pointer rounded bg-emerald-800/60 px-2 py-1 text-emerald-200 hover:bg-emerald-800/80 disabled:opacity-50"
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
							<div class="flex items-center justify-between">
								<div class="flex-1">
									<p class="text-body-small text-bright font-medium">{apiKey.name}</p>
									<p class="text-caption text-tertiary">•••• {apiKey.lastFour}</p>
								</div>
								<div class="flex gap-1">
									<button
										onclick={() => startEditingApiKey(apiKey)}
										class="text-caption text-tertiary hover:text-secondary cursor-pointer rounded px-2 py-1 hover:bg-slate-600/40"
									>
										<Edit class="h-4 w-4" />
									</button>
									<button
										onclick={() => deleteApiKey(apiKey.id, apiKey.name)}
										class="text-caption text-error cursor-pointer rounded px-2 py-1 hover:bg-red-900/20 hover:text-red-300"
									>
										<Delete class="h-4 w-4" />
									</button>
								</div>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{:else}
		<div
			class="rounded-lg border border-slate-600/60 bg-slate-700/40 p-8 text-center backdrop-blur-lg"
		>
			<p class="text-body text-secondary mb-2">No API Keys yet</p>
			<p class="text-body-small text-muted">
				Create your first API key to get started with programmatic access!
			</p>
		</div>
	{/if}
</div>
