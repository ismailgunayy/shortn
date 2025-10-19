<script lang="ts">
	import { goto } from "$app/navigation";
	import Link from "$lib/icons/link.icon.svelte";
	import Dashboard from "$lib/icons/dashboard.icon.svelte";
	import Key from "$lib/icons/key.icon.svelte";
	import Close from "$lib/icons/close.icon.svelte";
	import { resolve } from "$app/paths";

	let { isOpen = $bindable(false) } = $props();

	function handleRegister() {
		goto(resolve("/web/register"));
	}

	function handleLogin() {
		goto(resolve("/web/login"));
	}

	function handleClose() {
		isOpen = false;
	}

	function handleClickOutside(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			handleClose();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === "Escape") {
			handleClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<!-- Modal backdrop -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-slate-800/80 p-4 backdrop-blur-xs"
		onclick={handleClickOutside}
		onkeydown={handleKeydown}
		role="dialog"
		tabindex="-1"
		aria-labelledby="upgrade-modal-title"
		aria-modal="true"
	>
		<!-- Modal content -->
		<div
			class="relative w-full max-w-lg transform rounded-2xl border border-slate-600/60 bg-slate-600/25 p-6 shadow-2xl shadow-slate-900/20 backdrop-blur-3xl transition-all sm:p-8"
		>
			<!-- Close button -->
			<button
				onclick={handleClose}
				class="text-muted hover:text-bright absolute top-4 right-4 p-1 transition-colors"
				aria-label="Close modal"
			>
				<Close />
			</button>

			<!-- Modal header -->
			<div class="mb-6 text-center">
				<h2
					id="upgrade-modal-title"
					class="bg-gradient-to-r from-slate-200 to-slate-100 bg-clip-text text-xl font-bold text-transparent sm:text-2xl"
				>
					Unlock All Features
				</h2>
				<p class="text-secondary mt-2">Create your free account and get access to powerful features</p>
			</div>

			<!-- Features list -->
			<div class="mb-6 space-y-4">
				<div class="flex items-start gap-4 rounded-xl border border-slate-600/60 bg-slate-700/40 p-4 backdrop-blur-lg">
					<div
						class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-slate-400/20 to-slate-600/20"
					>
						<Link />
					</div>
					<div>
						<h3 class="text-bright font-semibold">Custom Branded URLs</h3>
						<p class="text-muted text-sm">Create memorable, branded short links.</p>
					</div>
				</div>

				<div class="flex items-start gap-4 rounded-xl border border-slate-600/60 bg-slate-700/40 p-4 backdrop-blur-lg">
					<div
						class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-slate-400/20 to-slate-600/20"
					>
						<Key />
					</div>
					<div>
						<h3 class="text-bright font-semibold">API Keys & Integration</h3>
						<p class="text-muted text-sm">Generate API keys to integrate Shortn into your apps and workflows.</p>
					</div>
				</div>

				<div class="flex items-start gap-4 rounded-xl border border-slate-600/60 bg-slate-700/40 p-4 backdrop-blur-lg">
					<div
						class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-slate-400/20 to-slate-600/20"
					>
						<Dashboard />
					</div>
					<div>
						<h3 class="text-bright font-semibold">Personal Dashboard</h3>
						<p class="text-muted text-sm">Manage your URLs and API keys from a centralized dashboard.</p>
					</div>
				</div>
			</div>

			<!-- Action buttons -->
			<div class="space-y-3">
				<button
					onclick={handleRegister}
					class="text-button-color w-full transform rounded-xl bg-gradient-to-r from-slate-400/80 to-slate-600/80 px-6 py-2.5 font-semibold shadow-lg backdrop-blur-lg transition-all duration-200 hover:scale-[1.02] hover:from-slate-400 hover:to-slate-600 hover:shadow-xl hover:shadow-slate-900/30 focus:ring-2 focus:ring-slate-400/20 focus:outline-none active:scale-[0.98] sm:py-3"
				>
					Create an account
				</button>
				<button
					onclick={handleLogin}
					class="text-secondary hover:text-bright w-full rounded-xl border border-slate-600/60 bg-slate-700/40 px-6 py-2.5 font-medium backdrop-blur-lg transition-all duration-200 hover:bg-slate-600/40 sm:py-3"
				>
					Already have an account?
				</button>
			</div>
		</div>
	</div>
{/if}
