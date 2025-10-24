<script lang="ts">
	import Loading from "$lib/icons/loading.icon.svelte";
	import Eye from "$lib/icons/eye.icon.svelte";
	import EyeOff from "$lib/icons/eye-off.icon.svelte";
	import { loginSchema, type LoginForm } from "$lib/schemas/auth.schema";
	import { authStore } from "$lib/stores/auth.store";
	import { resolve } from "$app/paths";
	import { clientApi } from "$lib/services/api/api.client";
	import { config } from "$lib/common/config";

	let loading = $state(false);
	let formData = $state<LoginForm>({
		email: "",
		password: ""
	});
	let showPassword = $state(false);
	let errors = $state<Partial<Record<keyof LoginForm, string>>>({});
	let authState = $derived($authStore);

	function validateForm(): boolean {
		const result = loginSchema.safeParse(formData);

		if (!result.success) {
			errors = {};

			for (const error of result.error.issues) {
				const field = error.path[0] as keyof LoginForm;
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
			await clientApi.auth.login(formData);
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Login - Shortn URL Shortener | Access Your Account</title>
	<meta
		name="description"
		content="Log in to your Shortn account to access your dashboard, manage your shortened URLs, and view analytics. Secure login to your URL shortener account."
	/>
	<meta
		name="keywords"
		content="login, sign in, URL shortener account, dashboard access, link management"
	/>
	<meta
		name="robots"
		content="index, follow"
	/>
	<link
		rel="canonical"
		href={`${config.HTTP.CLIENT_URL}/web/login`}
	/>
</svelte:head>

<div class="flex flex-col items-center justify-center">
	<!-- Title -->
	<div class="mb-8 text-center">
		<h1
			class="text-heading-1 mb-3 bg-gradient-to-r from-slate-400 to-slate-200 bg-clip-text font-bold text-transparent"
		>
			Log In
		</h1>
		<p class="text-body bg-gradient-to-r from-slate-300 to-slate-100 bg-clip-text text-transparent">
			Welcome back to Shortn
		</p>
	</div>

	<!-- Login Form -->
	<div class="w-full max-w-md">
		<form
			onsubmit={handleSubmit}
			class="rounded-2xl border border-slate-600/60 bg-slate-600/25 p-6 shadow-2xl shadow-slate-900/20 backdrop-blur-3xl sm:p-8"
		>
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
						placeholder="Your password"
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
				disabled={authState.loading || !formData.email.trim() || !formData.password.trim()}
				class="text-button text-button-color w-full transform rounded-xl bg-gradient-to-r from-slate-400/80 to-slate-600/80 px-6 py-2.5 font-semibold shadow-lg backdrop-blur-lg transition-all duration-200 hover:scale-[1.02] hover:from-slate-400 hover:to-slate-600 hover:shadow-xl hover:shadow-slate-900/30 focus:ring-2 focus:ring-slate-400/20 focus:outline-none active:scale-[0.98] disabled:opacity-50"
			>
				{#if loading}
					<span class="flex items-center justify-center">
						<Loading class="mr-2" />
						Logging In...
					</span>
				{:else}
					Log In
				{/if}
			</button>

			<!-- Register Link -->
			<p class="text-body-small text-muted mt-4 text-center">
				Don't have an account?
				<a
					href={resolve("/web/register")}
					class="text-secondary hover:text-bright font-medium transition-colors"
				>
					Register
				</a>
			</p>
		</form>
	</div>
</div>
