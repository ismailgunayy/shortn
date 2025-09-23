<script lang="ts">
	import { authStore } from '$lib/stores/auth.store';
	import { registerSchema, type RegisterForm } from '$lib/schemas/auth.schema';
	import Loading from '$lib/icons/Loading.svelte';

	let formData = $state<RegisterForm>({
		fullName: '',
		email: '',
		password: ''
	});

	let errors = $state<Partial<Record<keyof RegisterForm, string>>>({});
	let formError = $state<string>('');

	let authState = $derived($authStore);

	function validateField(field: keyof RegisterForm) {
		const fieldSchema = registerSchema.shape[field];
		const result = fieldSchema.safeParse(formData[field]);

		if (!result.success) {
			const firstError = result.error.issues[0];
			errors[field] = firstError?.message || 'Invalid value';
		} else {
			errors[field] = '';
		}
	}

	function validateForm(): boolean {
		const result = registerSchema.safeParse(formData);

		if (!result.success) {
			errors = {};

			for (const error of result.error.issues) {
				const field = error.path[0] as keyof RegisterForm;
				errors[field] = error.message || 'Invalid value';
			}
			return false;
		}

		errors = {};
		formError = '';
		return true;
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();

		if (!validateForm()) {
			return;
		}

		const result = await authStore.register(formData);

		if (!result.success) {
			formError = result.error || 'Registration failed';
		}
	}
</script>

<svelte:head>
	<title>Shortn | Sign Up</title>
	<meta name="description" content="Create your Shortn account" />
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center px-4 pt-20">
	<!-- Title -->
	<div class="mb-8 text-center">
		<h1
			class="text-heading-1 mb-3 bg-gradient-to-r from-slate-400 to-slate-200 bg-clip-text font-bold text-transparent"
		>
			Sign Up
		</h1>
		<p class="text-body bg-gradient-to-r from-slate-300 to-slate-100 bg-clip-text text-transparent">
			Create your Shortn account
		</p>
	</div>

	<!-- Register Form -->
	<div class="w-full max-w-md">
		<form
			onsubmit={handleSubmit}
			class="rounded-2xl border border-slate-600/60 bg-slate-600/25 p-6 shadow-2xl shadow-slate-900/20 backdrop-blur-3xl sm:p-8"
		>
			<!-- General Error -->
			{#if formError}
				<div
					class="text-error mb-4 rounded-lg border border-red-800/50 bg-red-900/20 p-3 backdrop-blur-lg"
				>
					{formError}
				</div>
			{/if}

			<!-- Full Name Field -->
			<div class="mb-4">
				<label for="fullName" class="text-form-label"> Full Name </label>
				<input
					id="fullName"
					type="text"
					bind:value={formData.fullName}
					onblur={() => validateField('fullName')}
					placeholder="John Doe"
					class="text-form-input w-full rounded-xl border border-slate-600/60 bg-slate-800/40 px-4 py-2.5 placeholder-slate-500 backdrop-blur-lg transition-all duration-200 focus:border-slate-600/60 focus:outline-none focus:ring-2 focus:ring-slate-400/20"
					disabled={authState.loading}
					required
				/>
				{#if errors.fullName}
					<p class="text-error mt-1">{errors.fullName}</p>
				{/if}
			</div>

			<!-- Email Field -->
			<div class="mb-4">
				<label for="email" class="text-form-label"> Email </label>
				<input
					id="email"
					type="email"
					bind:value={formData.email}
					onblur={() => validateField('email')}
					placeholder="your@email.com"
					class="text-form-input w-full rounded-xl border border-slate-600/60 bg-slate-800/40 px-4 py-2.5 placeholder-slate-500 backdrop-blur-lg transition-all duration-200 focus:border-slate-600/60 focus:outline-none focus:ring-2 focus:ring-slate-400/20"
					disabled={authState.loading}
					required
				/>
				{#if errors.email}
					<p class="text-error mt-1">{errors.email}</p>
				{/if}
			</div>

			<!-- Password Field -->
			<div class="mb-6">
				<label for="password" class="text-form-label"> Password </label>
				<input
					id="password"
					type="password"
					bind:value={formData.password}
					onblur={() => validateField('password')}
					placeholder="At least 12 characters"
					class="text-form-input w-full rounded-xl border border-slate-600/60 bg-slate-800/40 px-4 py-2.5 placeholder-slate-500 backdrop-blur-lg transition-all duration-200 focus:border-slate-600/60 focus:outline-none focus:ring-2 focus:ring-slate-400/20"
					disabled={authState.loading}
					required
				/>
				{#if errors.password}
					<p class="text-error mt-1">{errors.password}</p>
				{/if}
			</div>

			<!-- Submit Button -->
			<button
				type="submit"
				disabled={authState.loading ||
					!formData.fullName.trim() ||
					!formData.email.trim() ||
					!formData.password.trim()}
				class="text-button w-full transform cursor-pointer rounded-xl bg-gradient-to-r from-slate-400/80 to-slate-600/80 px-6 py-2.5 font-semibold text-slate-100 shadow-lg backdrop-blur-lg transition-all duration-200 hover:scale-[1.02] hover:from-slate-400 hover:to-slate-600 hover:shadow-xl hover:shadow-slate-900/30 focus:outline-none focus:ring-2 focus:ring-slate-400/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
			>
				{#if authState.loading}
					<span class="flex items-center justify-center">
						<Loading />
						Creating Account...
					</span>
				{:else}
					Sign Up
				{/if}
			</button>

			<!-- Login Link -->
			<p class="text-body-small mt-4 text-center text-slate-400">
				Already have an account?
				<a
					href="/web/login"
					class="font-medium text-slate-300 transition-colors hover:text-slate-100"
				>
					Sign in
				</a>
			</p>
		</form>
	</div>
</div>
