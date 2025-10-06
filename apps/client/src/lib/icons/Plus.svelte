<script lang="ts">
	interface Props {
		class?: string;
	}

	let { class: className = "h-4 w-4" }: Props = $props();
</script>

<svg
	class={className}
	fill="none"
	stroke="currentColor"
	viewBox="0 0 24 24"
	xmlns="http://www.w3.org/2000/svg"
>
	<path
		stroke-linecap="round"
		stroke-linejoin="round"
		stroke-width="2"
		d="M12 4v16m8-8H4"
	></path>
</svg>
