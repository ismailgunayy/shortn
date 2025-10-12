<script lang="ts">
	import { authStore } from "$lib/stores/auth.store";
	import { errorStore } from "$lib/stores/error.store";
	import { fullNameSchema, passwordSchema } from "$lib/schemas/auth.schema";
	import Loading from "$lib/icons/loading.svelte";
	import Delete from "$lib/icons/delete.svelte";
	import Eye from "$lib/icons/eye.svelte";
	import EyeOff from "$lib/icons/eye-off.svelte";

	let fullName = $state("");
	let currentPassword = $state("");
	let newPassword = $state("");

	let showPassword = $state(false);

	let updateLoading = $state(false);
	let deleteLoading = $state(false);
	let errors = $state<{
		fullName?: string;
		currentPassword?: string;
		newPassword?: string;
	}>({});

	let showDeleteConfirm = $state(false);
	let deleteConfirmText = $state("");

	const auth = $derived($authStore);

	// Initialize form with current user data
	$effect(() => {
		if (auth.user) {
			fullName = auth.user.fullName;
		}
	});

	function validateUpdateForm(): boolean {
		errors = {};

		// Always validate full name if it's being changed
		if (fullName.trim() !== auth.user?.fullName) {
			const fullNameResult = fullNameSchema.safeParse(fullName);
			if (!fullNameResult.success) {
				const firstError = fullNameResult.error.issues[0];
				errors.fullName = firstError ? firstError.message : "Full name is required";
			}
		}

		// If changing password, validate password fields
		if (newPassword || currentPassword) {
			if (!currentPassword) {
				errors.currentPassword = "Current password is required";
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
		}

		return Object.keys(errors).length === 0;
	}

	async function handleUpdateAccount(event: Event) {
		event.preventDefault();

		if (!validateUpdateForm()) return;

		updateLoading = true;

		try {
			const updateData: { fullName?: string; password?: string } = {};

			if (fullName.trim() !== auth.user?.fullName) {
				updateData.fullName = fullName.trim();
			}

			if (newPassword) {
				updateData.password = newPassword;
			}

			if (Object.keys(updateData).length === 0) {
				errorStore.showInfo("No changes to save");
				return;
			}

			const result = await authStore.updateUser(updateData);

			if (result.success) {
				currentPassword = "";
				newPassword = "";
				showPassword = false;
				// Success message is handled by the auth store
			}
			// Errors are handled by the auth store
		} catch (err) {
			errorStore.handleUnknownError(err, {
				source: "account_page",
				action: "update_account"
			});
		} finally {
			updateLoading = false;
		}
	}

	async function handleDeleteAccount() {
		if (deleteConfirmText !== "DELETE") {
			errorStore.showInfo("Please type 'DELETE' to confirm");
			return;
		}

		deleteLoading = true;

		try {
			const result = await authStore.deleteAccount();
			// Success and errors are handled by the auth store
			if (!result.success) {
				deleteLoading = false;
			}
			// If successful, the store will redirect to home
		} catch (err) {
			errorStore.handleUnknownError(err, {
				source: "account_page",
				action: "delete_account"
			});
			deleteLoading = false;
		}
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
		<h1
			class="text-heading-1 mb-3 bg-gradient-to-r from-slate-400 to-slate-200 bg-clip-text font-bold text-transparent"
		>
			Account
		</h1>
		<p class="text-body bg-gradient-to-r from-slate-300 to-slate-100 bg-clip-text text-transparent">
			Manage your account information and security
		</p>
	</div>

	<!-- Account Form -->
	<div class="mb-12 rounded-xl border border-slate-600/60 bg-slate-700/40 p-8 backdrop-blur-lg">
		<form
			onsubmit={handleUpdateAccount}
			class="space-y-8"
		>
			<!-- Profile Information Section -->
			<div>
				<h2 class="text-heading-3 text-bright mb-2 font-semibold">Profile Information</h2>
				<!-- Full Name -->
				<div>
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
						class="text-form-input mt-1 w-full rounded-xl border border-slate-600/60 bg-slate-800/40 px-4 py-2.5 placeholder-slate-500 backdrop-blur-lg transition-all duration-200 focus:border-slate-500/80 focus:outline-none focus:ring-2 focus:ring-slate-400/20"
						disabled={updateLoading}
					/>
					{#if errors.fullName}
						<p class="text-error mt-1">{errors.fullName}</p>
					{/if}
				</div>

				<!-- Submit Button for Profile -->
				<button
					type="submit"
					disabled={updateLoading}
					class="text-button text-button-color mt-4 transform cursor-pointer rounded-xl bg-gradient-to-r from-slate-400/80 to-slate-600/80 px-4 py-2 font-semibold shadow-lg backdrop-blur-lg transition-all duration-200 hover:scale-[1.02] hover:from-slate-400 hover:to-slate-600 hover:shadow-xl hover:shadow-slate-900/30 focus:outline-none focus:ring-2 focus:ring-slate-400/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
				>
					{#if updateLoading}
						<span class="flex items-center justify-center">
							<Loading />
							Saving...
						</span>
					{:else}
						Save
					{/if}
				</button>
			</div>

			<!-- Divider -->
			<hr class="border-slate-600/40" />

			<!-- Change Password Section -->
			<div>
				<h2 class="text-heading-3 text-bright mb-2 font-semibold">Change Password</h2>

				<div class="space-y-4">
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
								class="text-form-input w-full rounded-xl border border-slate-600/60 bg-slate-800/40 px-4 py-2.5 pr-12 placeholder-slate-500 backdrop-blur-lg transition-all duration-200 focus:border-slate-500/80 focus:outline-none focus:ring-2 focus:ring-slate-400/20"
								disabled={updateLoading}
							/>
							<button
								type="button"
								onclick={() => (showPassword = !showPassword)}
								class="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-300 focus:outline-none"
								disabled={updateLoading}
								tabindex="-1"
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
								minlength="12"
								class="text-form-input w-full rounded-xl border border-slate-600/60 bg-slate-800/40 px-4 py-2.5 pr-12 placeholder-slate-500 backdrop-blur-lg transition-all duration-200 focus:border-slate-500/80 focus:outline-none focus:ring-2 focus:ring-slate-400/20"
								disabled={updateLoading}
							/>
							<button
								type="button"
								onclick={() => (showPassword = !showPassword)}
								class="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-300 focus:outline-none"
								disabled={updateLoading}
								tabindex="-1"
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
					disabled={updateLoading || !currentPassword || !newPassword}
					class="text-button text-button-color mt-4 transform cursor-pointer rounded-xl bg-gradient-to-r from-slate-400/80 to-slate-600/80 px-4 py-2 font-semibold shadow-lg backdrop-blur-lg transition-all duration-200 hover:scale-[1.02] hover:from-slate-400 hover:to-slate-600 hover:shadow-xl hover:shadow-slate-900/30 focus:outline-none focus:ring-2 focus:ring-slate-400/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
				>
					{#if updateLoading}
						<span class="flex items-center justify-center">
							<Loading />
							Updating...
						</span>
					{:else}
						Change Password
					{/if}
				</button>
			</div>
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
				onclick={() => (showDeleteConfirm = true)}
				class="text-button rounded-xl bg-red-600/80 px-6 py-2.5 font-semibold text-white transition-all duration-200 hover:bg-red-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400/20"
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
						class="text-form-input mt-1 w-full rounded-xl border border-red-600/60 bg-red-900/40 px-4 py-2.5 placeholder-red-400/60 backdrop-blur-lg transition-all duration-200 focus:border-red-500/80 focus:outline-none focus:ring-2 focus:ring-red-400/20"
						disabled={deleteLoading}
					/>
				</div>

				<div class="flex gap-3">
					<button
						onclick={handleDeleteAccount}
						disabled={deleteLoading || deleteConfirmText !== "DELETE"}
						class="text-button flex-1 rounded-xl bg-red-600/80 px-6 py-2.5 font-semibold text-white transition-all duration-200 hover:bg-red-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400/20 disabled:cursor-not-allowed disabled:opacity-50"
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
						onclick={cancelDelete}
						disabled={deleteLoading}
						class="text-button text-secondary hover:text-bright rounded-xl border border-slate-600/60 bg-slate-700/40 px-6 py-2.5 font-medium backdrop-blur-lg transition-all hover:bg-slate-600/40 focus:outline-none focus:ring-2 focus:ring-slate-400/20 disabled:opacity-50"
					>
						Cancel
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>
