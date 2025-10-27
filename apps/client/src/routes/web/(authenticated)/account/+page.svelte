<script lang="ts">
	import { authStore } from "$lib/stores/auth.store";
	import { fullNameSchema, passwordSchema } from "$lib/schemas/auth.schema";
	import Loading from "$lib/icons/loading.icon.svelte";
	import Delete from "$lib/icons/delete.icon.svelte";
	import Eye from "$lib/icons/eye.icon.svelte";
	import EyeOff from "$lib/icons/eye-off.icon.svelte";
	import { clientApi } from "$lib/services/api/api.client";

	let fullName = $state("");
	let currentPassword = $state("");
	let newPassword = $state("");

	let showPassword = $state(false);

	let updateProfileLoading = $state(false);
	let changePasswordLoading = $state(false);
	let deleteLoading = $state(false);
	let errors = $state<{
		fullName?: string;
		currentPassword?: string;
		newPassword?: string;
	}>({});

	let showDeleteConfirm = $state(false);
	let deleteConfirmText = $state("");

	const authState = $derived($authStore);

	// Initialize form with current user data
	$effect(() => {
		if (authState.user) {
			fullName = authState.user.fullName;
		}
	});

	function validateProfileForm(): boolean {
		errors.fullName = undefined;

		const fullNameResult = fullNameSchema.safeParse(fullName);
		if (!fullNameResult.success) {
			const firstError = fullNameResult.error.issues[0];
			errors.fullName = firstError ? firstError.message : "Full name is required";
		}

		return !errors.fullName;
	}

	function validatePasswordForm(): boolean {
		errors.currentPassword = undefined;
		errors.newPassword = undefined;

		if (!currentPassword) {
			errors.currentPassword = "Current password is required";
		} else {
			const currentPasswordResult = passwordSchema.safeParse(currentPassword);
			if (!currentPasswordResult.success) {
				const firstError = currentPasswordResult.error.issues[0];
				errors.currentPassword = firstError ? firstError.message : "Invalid current password";
			}
		}

		if (!newPassword) {
			errors.newPassword = "New password is required";
		} else {
			const passwordResult = passwordSchema.safeParse(newPassword);
			if (!passwordResult.success) {
				const firstError = passwordResult.error.issues[0];
				errors.newPassword = firstError ? firstError.message : "Invalid password";
			}
		}

		return !errors.currentPassword && !errors.newPassword;
	}

	async function handleUpdateProfile(event: Event) {
		event.preventDefault();

		if (!validateProfileForm()) return;

		updateProfileLoading = true;

		await clientApi.auth.updateUser({ fullName: fullName.trim() });

		updateProfileLoading = false;
	}

	async function handleChangePassword(event: Event) {
		event.preventDefault();

		if (!validatePasswordForm()) return;

		changePasswordLoading = true;

		const result = await clientApi.auth.changePassword({
			currentPassword,
			newPassword
		});

		if (result.success) {
			currentPassword = "";
			newPassword = "";
			showPassword = false;
		}

		changePasswordLoading = false;
	}

	async function handleDeleteAccount() {
		deleteLoading = true;

		const result = await clientApi.auth.deleteAccount();

		if (!result.success) {
			deleteLoading = false;
		}

		deleteLoading = false;
	}

	function cancelDelete() {
		showDeleteConfirm = false;
		deleteConfirmText = "";
	}
</script>

<svelte:head>
	<title>Shortn | Account</title>
	<meta
		name="description"
		content="Manage your Shortn account"
	/>
</svelte:head>

<div class="mx-auto max-w-2xl">
	<!-- Header -->
	<div class="mb-8 text-center">
		<h1 class="text-heading-1 mb-3 bg-linear-to-r from-slate-400 to-slate-200 bg-clip-text font-bold text-transparent">
			Account
		</h1>
		<p class="text-body bg-linear-to-r from-slate-300 to-slate-100 bg-clip-text text-transparent">
			Manage your account information and security
		</p>
	</div>

	<!-- Account Form -->
	<div class="mb-12 rounded-xl border border-slate-600/60 bg-slate-700/40 p-8 backdrop-blur-lg">
		<!-- Profile Information Section -->
		<form
			onsubmit={handleUpdateProfile}
			class="mb-8"
		>
			<h2 class="text-heading-3 text-bright mb-4 font-semibold">Profile Information</h2>
			<!-- Full Name -->
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
					bind:value={fullName}
					required
					class="text-form-input mt-1 w-full rounded-xl border border-slate-600/60 bg-slate-800/40 px-4 py-2.5 placeholder-slate-500 backdrop-blur-lg transition-all duration-200 focus:border-slate-500/80 focus:ring-2 focus:ring-slate-400/20 focus:outline-none"
					disabled={updateProfileLoading}
				/>
				{#if errors.fullName}
					<p class="text-error mt-1">{errors.fullName}</p>
				{/if}
			</div>

			<!-- Submit Button for Profile -->
			<button
				type="submit"
				disabled={updateProfileLoading || fullName.trim() === authState.user?.fullName}
				class="text-button text-button-color transform rounded-xl bg-linear-to-r from-slate-400/80 to-slate-600/80 px-4 py-2 font-semibold shadow-lg backdrop-blur-lg transition-all duration-200 hover:scale-[1.02] hover:from-slate-400 hover:to-slate-600 hover:shadow-xl hover:shadow-slate-900/30 focus:ring-2 focus:ring-slate-400/20 focus:outline-none active:scale-[0.98] disabled:opacity-50"
			>
				{#if updateProfileLoading}
					<span class="flex items-center justify-center">
						<Loading />
						Saving...
					</span>
				{:else}
					Save Profile
				{/if}
			</button>
		</form>

		<!-- Divider -->
		<hr class="mb-8 border-slate-600/40" />

		<!-- Change Password Section -->
		<form onsubmit={handleChangePassword}>
			<h2 class="text-heading-3 text-bright mb-4 font-semibold">Change Password</h2>

			<div class="mb-4 space-y-4">
				<!-- Current Password -->
				<div>
					<label
						for="currentPassword"
						class="text-form-label"
					>
						Current Password
					</label>
					<div class="relative mt-1">
						<input
							id="currentPassword"
							type={showPassword ? "text" : "password"}
							bind:value={currentPassword}
							class="text-form-input w-full rounded-xl border border-slate-600/60 bg-slate-800/40 px-4 py-2.5 pr-12 placeholder-slate-500 backdrop-blur-lg transition-all duration-200 focus:border-slate-500/80 focus:ring-2 focus:ring-slate-400/20 focus:outline-none"
							disabled={changePasswordLoading}
						/>
						<button
							type="button"
							onclick={() => (showPassword = !showPassword)}
							class="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-300 focus:outline-none"
							disabled={changePasswordLoading}
							tabindex="-1"
							aria-label={showPassword ? "Hide password" : "Show password"}
						>
							{#if showPassword}
								<EyeOff class="h-5 w-5" />
							{:else}
								<Eye class="h-5 w-5" />
							{/if}
						</button>
					</div>
					{#if errors.currentPassword}
						<p class="text-error mt-1">{errors.currentPassword}</p>
					{/if}
				</div>

				<!-- New Password -->
				<div>
					<label
						for="newPassword"
						class="text-form-label"
					>
						New Password
					</label>
					<div class="relative mt-1">
						<input
							id="newPassword"
							type={showPassword ? "text" : "password"}
							bind:value={newPassword}
							class="text-form-input w-full rounded-xl border border-slate-600/60 bg-slate-800/40 px-4 py-2.5 pr-12 placeholder-slate-500 backdrop-blur-lg transition-all duration-200 focus:border-slate-500/80 focus:ring-2 focus:ring-slate-400/20 focus:outline-none"
							disabled={changePasswordLoading}
						/>
						<button
							type="button"
							onclick={() => (showPassword = !showPassword)}
							class="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-300 focus:outline-none"
							disabled={changePasswordLoading}
							tabindex="-1"
							aria-label={showPassword ? "Hide password" : "Show password"}
						>
							{#if showPassword}
								<EyeOff class="h-5 w-5" />
							{:else}
								<Eye class="h-5 w-5" />
							{/if}
						</button>
					</div>
					{#if errors.newPassword}
						<p class="text-error mt-1">{errors.newPassword}</p>
					{/if}
				</div>
			</div>

			<!-- Submit Button for Password -->
			<button
				type="submit"
				disabled={changePasswordLoading || !currentPassword || !newPassword}
				class="text-button text-button-color transform rounded-xl bg-linear-to-r from-slate-400/80 to-slate-600/80 px-4 py-2 font-semibold shadow-lg backdrop-blur-lg transition-all duration-200 hover:scale-[1.02] hover:from-slate-400 hover:to-slate-600 hover:shadow-xl hover:shadow-slate-900/30 focus:ring-2 focus:ring-slate-400/20 focus:outline-none active:scale-[0.98] disabled:opacity-50"
			>
				{#if changePasswordLoading}
					<span class="flex items-center justify-center">
						<Loading />
						Updating...
					</span>
				{:else}
					Change Password
				{/if}
			</button>
		</form>
	</div>

	<!-- Delete Account Section -->
	<div class="rounded-xl border border-red-800/50 bg-red-900/20 p-6 backdrop-blur-lg">
		<h2 class="text-heading-3 text-bright mb-4 flex items-center gap-2 font-semibold">
			<Delete class="h-5 w-5 text-red-400" />
			Delete Account
		</h2>

		<p class="text-body text-tertiary mb-6">
			This action cannot be undone. This will permanently delete your account and all associated data including
			shortened URLs and API keys.
		</p>

		{#if !showDeleteConfirm}
			<button
				type="button"
				onclick={() => (showDeleteConfirm = true)}
				class="text-button rounded-xl bg-red-600/80 px-6 py-2.5 font-semibold text-white transition-all duration-200 hover:bg-red-600 hover:shadow-lg focus:ring-2 focus:ring-red-400/20 focus:outline-none"
			>
				Delete Account
			</button>
		{:else}
			<div class="space-y-4">
				<div>
					<label
						for="deleteConfirm"
						class="text-form-label text-red-300"
					>
						Type "DELETE" to confirm
					</label>
					<input
						id="deleteConfirm"
						type="text"
						bind:value={deleteConfirmText}
						placeholder="DELETE"
						class="text-form-input mt-1 w-full rounded-xl border border-red-600/60 bg-red-900/40 px-4 py-2.5 placeholder-red-400/60 backdrop-blur-lg transition-all duration-200 focus:border-red-500/80 focus:ring-2 focus:ring-red-400/20 focus:outline-none"
						disabled={deleteLoading}
					/>
				</div>

				<div class="flex gap-3">
					<button
						type="button"
						onclick={handleDeleteAccount}
						disabled={deleteLoading || deleteConfirmText !== "DELETE"}
						class="text-button flex-1 rounded-xl bg-red-600/80 px-6 py-2.5 font-semibold text-white transition-all duration-200 hover:bg-red-600 hover:shadow-lg focus:ring-2 focus:ring-red-400/20 focus:outline-none disabled:opacity-50"
					>
						{#if deleteLoading}
							<span class="flex items-center justify-center">
								<Loading />
								Deleting...
							</span>
						{:else}
							Confirm Delete
						{/if}
					</button>
					<button
						type="button"
						onclick={cancelDelete}
						disabled={deleteLoading}
						class="text-button text-secondary hover:text-bright rounded-xl border border-slate-600/60 bg-slate-700/40 px-6 py-2.5 font-medium backdrop-blur-lg transition-all hover:bg-slate-600/40 focus:ring-2 focus:ring-slate-400/20 focus:outline-none disabled:opacity-50"
					>
						Cancel
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>
