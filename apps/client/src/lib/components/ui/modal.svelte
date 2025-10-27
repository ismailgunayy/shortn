<script lang="ts">
	import Close from "$lib/icons/close.icon.svelte";
	import type { Snippet } from "svelte";

	interface Props {
		isOpen?: boolean;
		onClose?: () => void;
		title?: string;
		showCloseButton?: boolean;
		maxWidth?: "sm" | "md" | "lg";
		children?: Snippet;
	}

	let {
		isOpen = $bindable(false),
		onClose,
		title,
		showCloseButton = onClose !== undefined,
		maxWidth = "md",
		children
	}: Props = $props();

	const maxWidthClasses = {
		sm: "max-w-md",
		md: "max-w-lg",
		lg: "max-w-2xl"
	};

	function handleClose() {
		if (onClose) {
			onClose();
		} else {
			isOpen = false;
		}
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
		aria-labelledby={title ? "modal-title" : undefined}
		aria-modal="true"
	>
		<!-- Modal content -->
		<div
			class="relative w-full {maxWidthClasses[
				maxWidth
			]} transform rounded-2xl border border-slate-600/60 bg-slate-600/25 p-6 shadow-2xl shadow-slate-900/20 backdrop-blur-3xl transition-all sm:p-8"
		>
			<!-- Close button -->
			{#if showCloseButton}
				<button
					type="button"
					onclick={handleClose}
					class="text-muted hover:text-bright absolute top-4 right-4 p-1 transition-colors"
					aria-label="Close modal"
				>
					<Close />
				</button>
			{/if}

			<!-- Modal header -->
			{#if title}
				<div class="mb-6 {showCloseButton ? 'pr-8' : ''}">
					<h2
						id="modal-title"
						class="bg-linear-to-r from-slate-200 to-slate-100 bg-clip-text text-xl font-bold text-transparent sm:text-2xl"
					>
						{title}
					</h2>
				</div>
			{/if}

			<!-- Modal content -->
			{#if children}
				{@render children()}
			{/if}
		</div>
	</div>
{/if}
