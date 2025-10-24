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
		d="M19 9l-7 7-7-7"
	></path>
</svg>
