<script lang="ts">
	import { goto } from "$app/navigation";
	import { resolve } from "$app/paths";
	import { authStore } from "$lib/stores/auth.store";
	import { onMount } from "svelte";

	const { children } = $props();

	const authState = $derived($authStore);

	onMount(async () => {
		if (!authState.user && !authState.loading) {
			goto(resolve("/web/login"));
		}
	});
</script>

<div>
	{@render children?.()}
</div>
