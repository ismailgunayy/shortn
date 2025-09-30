<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Error from '$lib/icons/Error.svelte';

	let countdown = $state(5);

	onMount(() => {
		const interval = setInterval(() => {
			countdown--;
			if (countdown <= 0) {
				clearInterval(interval);
				goto('/');
			}
		}, 1000);

		return () => clearInterval(interval);
	});
</script>

<svelte:head>
	<title>Shortn | Page Not Found</title>
</svelte:head>

<div class="flex flex-col items-center justify-center">
	<!-- Main Container -->
	<div class="w-full max-w-lg px-4 opacity-90 sm:px-0">
		<div
			class="rounded-2xl border border-slate-600/60 bg-slate-600/25 p-6 shadow-2xl shadow-slate-900/20 backdrop-blur-3xl sm:p-8"
		>
			<div class="space-y-6 text-center">
				<!-- Error Icon -->
				<div class="flex justify-center">
					<div
						class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-red-800/30 bg-red-900/40 backdrop-blur-lg sm:mb-4 sm:h-16 sm:w-16"
					>
						<Error />
					</div>
				</div>

				<!-- Error Message -->
				<div class="space-y-2">
					<h1
						class="text-heading-2 bg-gradient-to-r from-slate-300 to-slate-100 bg-clip-text font-bold text-transparent"
					>
						You seem lost
					</h1>
				</div>

				<!-- Countdown and Redirect Info -->
				<div class="rounded-lg border border-slate-600/60 bg-slate-700/40 p-4 backdrop-blur-lg">
					<p class="text-body-small text-secondary">
						Let's get you back home in <span class="text-bright font-semibold">{countdown}</span>
						seconds...
					</p>
				</div>

				<!-- Manual Navigation Button -->
				<a
					href="/"
					class="text-button duration-230 text-button-color inline-flex transform cursor-pointer items-center justify-center rounded-xl
						   bg-gradient-to-r from-slate-600 to-slate-700 px-6 py-3 font-medium shadow-lg shadow-slate-900/20
						   backdrop-blur-lg transition-all hover:scale-[1.02] hover:from-slate-500 hover:to-slate-600 hover:shadow-xl hover:shadow-slate-900/30
						   focus:outline-none focus:ring-2 focus:ring-slate-400/20 active:scale-[0.98]"
				>
					Go home now
				</a>
			</div>
		</div>
	</div>
</div>
