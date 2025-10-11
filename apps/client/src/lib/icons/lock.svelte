<script lang="ts">
	interface Props {
		class?: string;
	}

	let { class: className = "h-4 w-4 text-secondary" }: Props = $props();
</script>

<svg
	class={className}
	fill="currentColor"
	viewBox="0 0 20 20"
>
	<path
		fill-rule="evenodd"
		d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
		clip-rule="evenodd"
	/>
</svg>
