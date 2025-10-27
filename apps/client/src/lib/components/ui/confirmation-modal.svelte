<script lang="ts">
	import Modal from "./modal.svelte";

	interface Props {
		isOpen?: boolean;
		title?: string;
		message: string;
		confirmText?: string;
		cancelText?: string;
		onConfirm: () => void;
		onCancel?: () => void;
		loading?: boolean;
	}

	let {
		isOpen = $bindable(false),
		title = "Confirm Action",
		message,
		confirmText = "Confirm",
		cancelText = "Cancel",
		onConfirm,
		onCancel,
		loading = false
	}: Props = $props();

	function handleConfirm() {
		onConfirm();
	}

	function handleCancel() {
		if (onCancel) {
			onCancel();
		} else {
			isOpen = false;
		}
	}
</script>

<Modal
	bind:isOpen
	{title}
	maxWidth="sm"
>
	<div class="space-y-6">
		<!-- Message -->
		<p class="text-secondary text-center">{message}</p>

		<!-- Action buttons -->
		<div class="flex gap-3">
			<button
				type="button"
				onclick={handleCancel}
				disabled={loading}
				class="text-button text-secondary hover:text-bright flex-1 rounded-xl border border-slate-600/60 bg-slate-700/40 px-6 py-2.5 font-medium backdrop-blur-lg transition-all hover:bg-slate-600/40 focus:ring-2 focus:ring-slate-400/20 focus:outline-none disabled:opacity-50"
			>
				{cancelText}
			</button>
			<button
				type="button"
				onclick={handleConfirm}
				disabled={loading}
				class="text-button-color flex-1 rounded-xl bg-linear-to-r from-slate-400/80 to-slate-600/80 px-6 py-2.5 font-semibold transition-all duration-200 hover:from-slate-400 hover:to-slate-600 focus:ring-2 focus:ring-slate-400/20 focus:outline-none disabled:opacity-50"
			>
				{confirmText}
			</button>
		</div>
	</div>
</Modal>
