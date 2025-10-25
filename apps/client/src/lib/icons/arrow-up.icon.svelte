<script lang="ts">
	interface Props {
		class?: string;
	}

	let { class: className = "h-4 w-4 text-tertiary" }: Props = $props();
</script>

<svg
	class={className}
	fill="none"
	stroke="currentColor"
	viewBox="0 0 24 24"
>
	<path
		stroke-linecap="round"
		stroke-linejoin="round"
		stroke-width="2"
		d="M12 19V5m-7 7l7-7 7 7"
	></path>
</svg>
