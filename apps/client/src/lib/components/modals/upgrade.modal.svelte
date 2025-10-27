<script lang="ts">
	import { goto } from "$app/navigation";
	import Link from "$lib/icons/link.icon.svelte";
	import Dashboard from "$lib/icons/dashboard.icon.svelte";
	import Key from "$lib/icons/key.icon.svelte";
	import { resolve } from "$app/paths";
	import Modal from "$lib/components/ui/modal.svelte";

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
</script>

<Modal
	bind:isOpen
	title="Unlock All Features"
	onClose={handleClose}
	maxWidth="md"
>
	<div class="space-y-6">
		<!-- Description -->
		<p class="text-secondary text-center">Create a free account to unlock these features</p>

		<!-- Features list -->
		<div class="space-y-4">
			<div class="flex items-start gap-4 rounded-xl border border-slate-600/60 bg-slate-700/40 p-4 backdrop-blur-lg">
				<div
					class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-r from-slate-400/20 to-slate-600/20"
				>
					<Link />
				</div>
				<div>
					<h3 class="text-bright font-semibold">Custom Branded URLs</h3>
					<p class="text-tertiary text-sm">Create memorable, branded short links</p>
				</div>
			</div>

			<div class="flex items-start gap-4 rounded-xl border border-slate-600/60 bg-slate-700/40 p-4 backdrop-blur-lg">
				<div
					class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-r from-slate-400/20 to-slate-600/20"
				>
					<Key />
				</div>
				<div>
					<h3 class="text-bright font-semibold">API Keys & Integration</h3>
					<p class="text-tertiary text-sm">Generate API keys to integrate Shortn into your apps</p>
				</div>
			</div>

			<div class="flex items-start gap-4 rounded-xl border border-slate-600/60 bg-slate-700/40 p-4 backdrop-blur-lg">
				<div
					class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-r from-slate-400/20 to-slate-600/20"
				>
					<Dashboard />
				</div>
				<div>
					<h3 class="text-bright font-semibold">Personal Dashboard</h3>
					<p class="text-tertiary text-sm">Manage your URLs and API keys from a dashboard</p>
				</div>
			</div>
		</div>

		<!-- Action buttons -->
		<div class="space-y-3">
			<button
				type="button"
				onclick={handleRegister}
				class="text-button-color w-full transform rounded-xl bg-linear-to-r from-slate-400/80 to-slate-600/80 px-6 py-2.5 font-semibold shadow-lg backdrop-blur-lg transition-all duration-200 hover:scale-[1.02] hover:from-slate-400 hover:to-slate-600 hover:shadow-xl hover:shadow-slate-900/30 focus:ring-2 focus:ring-slate-400/20 focus:outline-none active:scale-[0.98] sm:py-3"
			>
				Create an account
			</button>
			<button
				type="button"
				onclick={handleLogin}
				class="text-secondary hover:text-bright w-full rounded-xl border border-slate-600/60 bg-slate-700/40 px-6 py-2.5 font-medium backdrop-blur-lg transition-all duration-200 hover:bg-slate-600/40 sm:py-3"
			>
				Already have an account?
			</button>
		</div>
	</div>
</Modal>
