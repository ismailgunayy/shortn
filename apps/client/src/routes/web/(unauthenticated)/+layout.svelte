<script lang="ts">
	import { goto } from "$app/navigation";
	import { resolve } from "$app/paths";
	import { authStore } from "$lib/stores/auth.store";

	const { children } = $props();

	const authState = $derived($authStore);

	$effect(() => {
		if (authState.user && !authState.loading) {
			goto(resolve("/"));
		}
	});
</script>

<div>
	{@render children?.()}
</div>
