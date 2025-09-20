<script>
	export let error;
	export let status;
</script>

<svelte:head>
	<title>{status} - Page Not Found</title>
</svelte:head>

<div class="flex h-screen flex-col items-center justify-center text-center">
	<h1 class="text-6xl font-bold">{status}</h1>
	<p class="mt-4 text-lg">{error?.message || 'This page doesn’t exist.'}</p>
	<a href="/" class="mt-6 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
		Go back home
	</a>
</div>
