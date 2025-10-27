<script lang="ts">
	import { authStore } from "$lib/stores/auth.store";
	import { registerSchema, type RegisterForm } from "$lib/schemas/auth.schema";
	import Loading from "$lib/icons/loading.icon.svelte";
	import Eye from "$lib/icons/eye.icon.svelte";
	import EyeOff from "$lib/icons/eye-off.icon.svelte";
	import { clientApi } from "$lib/services/api/api.client";
	import { resolve } from "$app/paths";
	import { config } from "$lib/common/config";

	let loading = $state(false);
	let formData = $state<RegisterForm>({
		fullName: "",
		email: "",
		password: ""
	});
	let showPassword = $state(false);
	let errors = $state<Partial<Record<keyof RegisterForm, string>>>({});
	let authState = $derived($authStore);

	function validateForm(): boolean {
		const result = registerSchema.safeParse(formData);

		if (!result.success) {
			errors = {};

			for (const error of result.error.issues) {
				const field = error.path[0] as keyof RegisterForm;
				errors[field] = error.message || "Invalid value";
			}
			return false;
		}

		errors = {};
		return true;
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();

		if (validateForm()) {
			loading = true;
			await clientApi.auth.register(formData);
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Register - Create Free Shortn Account | URL Shortener Signup</title>
	<meta
		name="description"
		content="Create your free Shortn account to unlock custom URLs, analytics, API access, and advanced link management features. Sign up for free URL shortener service."
	/>
	<meta
		name="keywords"
		content="register, signup, create account, free URL shortener, custom URLs, API access, link analytics"
	/>
	<meta
		name="robots"
		content="index, follow"
	/>
	<link
		rel="canonical"
		href={`${config.HTTP.CLIENT_URL}/web/register`}
	/>
</svelte:head>

<div class="flex flex-col items-center justify-center">
	<!-- Title -->
	<div class="mb-8 text-center">
		<h1 class="text-heading-1 mb-3 bg-linear-to-r from-slate-400 to-slate-200 bg-clip-text font-bold text-transparent">
			Register
		</h1>
		<p class="text-body bg-linear-to-r from-slate-300 to-slate-100 bg-clip-text text-transparent">
			Create your Shortn account
		</p>
	</div>

	<!-- Register Form -->
	<div class="w-full max-w-md">
		<form
			onsubmit={handleSubmit}
			class="rounded-2xl border border-slate-600/60 bg-slate-600/25 p-6 shadow-2xl shadow-slate-900/20 backdrop-blur-3xl sm:p-8"
		>
			<!-- Full Name Field -->
			<div class="mb-4">
				<label
					for="fullName"
					class="text-form-label"
				>
					Full Name
				</label>
				<input
					id="fullName"
					type="text"
					bind:value={formData.fullName}
					placeholder="John Doe"
					class="text-form-input w-full rounded-xl border border-slate-600/60 bg-slate-800/40 px-4 py-2.5 placeholder-slate-500 backdrop-blur-lg transition-all duration-200 focus:border-slate-600/60 focus:ring-2 focus:ring-slate-400/20 focus:outline-none"
					disabled={authState.loading}
					required
				/>
				{#if errors.fullName}
					<p class="text-error mt-1">{errors.fullName}</p>
				{/if}
			</div>

			<!-- Email Field -->
			<div class="mb-4">
				<label
					for="email"
					class="text-form-label"
				>
					Email
				</label>
				<input
					id="email"
					type="text"
					bind:value={formData.email}
					placeholder="your@email.com"
					class="text-form-input w-full rounded-xl border border-slate-600/60 bg-slate-800/40 px-4 py-2.5 placeholder-slate-500 backdrop-blur-lg transition-all duration-200 focus:border-slate-600/60 focus:ring-2 focus:ring-slate-400/20 focus:outline-none"
					disabled={authState.loading}
					required
				/>
				{#if errors.email}
					<p class="text-error mt-1">{errors.email}</p>
				{/if}
			</div>

			<!-- Password Field -->
			<div class="mb-6">
				<label
					for="password"
					class="text-form-label"
				>
					Password
				</label>
				<div class="relative">
					<input
						id="password"
						type={showPassword ? "text" : "password"}
						bind:value={formData.password}
						placeholder="At least 12 characters"
						class="text-form-input w-full rounded-xl border border-slate-600/60 bg-slate-800/40 px-4 py-2.5 pr-12 placeholder-slate-500 backdrop-blur-lg transition-all duration-200 focus:border-slate-600/60 focus:ring-2 focus:ring-slate-400/20 focus:outline-none"
						disabled={authState.loading}
						required
					/>
					<button
						type="button"
						onclick={() => (showPassword = !showPassword)}
						class="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-300 focus:outline-none"
						disabled={authState.loading}
						aria-label={showPassword ? "Hide password" : "Show password"}
					>
						{#if showPassword}
							<EyeOff class="h-5 w-5" />
						{:else}
							<Eye class="h-5 w-5" />
						{/if}
					</button>
				</div>
				{#if errors.password}
					<p class="text-error mt-1">{errors.password}</p>
				{/if}
			</div>

			<!-- Submit Button -->
			<button
				type="submit"
				disabled={authState.loading || !formData.fullName.trim() || !formData.email.trim() || !formData.password.trim()}
				class="text-button text-button-color w-full transform rounded-xl bg-linear-to-r from-slate-400/80 to-slate-600/80 px-6 py-2.5 font-semibold shadow-lg backdrop-blur-lg transition-all duration-200 hover:scale-[1.02] hover:from-slate-400 hover:to-slate-600 hover:shadow-xl hover:shadow-slate-900/30 focus:ring-2 focus:ring-slate-400/20 focus:outline-none active:scale-[0.98] disabled:opacity-50"
			>
				{#if loading}
					<span class="flex items-center justify-center">
						<Loading />
						Creating Account...
					</span>
				{:else}
					Register
				{/if}
			</button>

			<!-- Login Link -->
			<p class="text-body-small text-tertiary mt-4 text-center">
				Already have an account?
				<a
					href={resolve("/web/login")}
					class="text-secondary hover:text-bright font-medium transition-colors"
				>
					Log in
				</a>
			</p>
		</form>
	</div>
</div>
