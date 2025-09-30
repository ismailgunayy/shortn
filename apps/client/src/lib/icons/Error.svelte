<script lang="ts">
	interface Props {
		class?: string;
	}

	let { class: className }: Props = $props();
</script>

<svg
	class={`text-error h-6 w-6 sm:h-8 sm:w-8 ${className}`}
	fill="none"
	stroke="currentColor"
	viewBox="0 0 24 24"
>
	<path
		stroke-linecap="round"
		stroke-linejoin="round"
		stroke-width="2"
		d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
	/>
</svg>
