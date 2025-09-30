<script lang="ts">
	interface Props {
		class?: string;
	}

	let { class: className = 'h-4 w-4 text-success' }: Props = $props();
</script>

<svg class={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
	<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
</svg>
