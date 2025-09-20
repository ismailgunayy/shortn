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
	<title>Shortn - Page Not Found</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center px-4">
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
						class="bg-gradient-to-r from-slate-300 to-slate-100 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl"
					>
						You seem lost
					</h1>
					<p class="text-md text-slate-300">And that's okay</p>
				</div>

				<!-- Countdown and Redirect Info -->
				<div class="rounded-lg border border-slate-600/60 bg-slate-700/40 p-4 backdrop-blur-lg">
					<p class="text-sm text-slate-300">
						Let's get you back home in <span class="font-semibold text-slate-200">{countdown}</span>
						seconds...
					</p>
				</div>

				<!-- Manual Navigation Button -->
				<a
					href="/"
					class="duration-230 inline-flex transform cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r
						   from-slate-600 to-slate-700 px-6 py-3 text-base font-medium text-slate-100 shadow-lg shadow-slate-900/20
						   backdrop-blur-lg transition-all hover:scale-[1.02] hover:from-slate-500 hover:to-slate-600 hover:shadow-xl hover:shadow-slate-900/30
						   focus:outline-none focus:ring-2 focus:ring-slate-400/20 active:scale-[0.98]"
				>
					Go home now
				</a>
			</div>
		</div>
	</div>
</div>
rt let error;
