import type { ApiErrorResponse, AppError, ErrorContext } from "$lib/types/error.types";
import {
	apiErrorToAppError,
	getErrorDisplayMessage,
	getToastDuration,
	networkErrorToAppError,
	unknownErrorToAppError
} from "$lib/utils/error-handler";
import { derived, writable } from "svelte/store";

import { ErrorSeverity } from "$lib/types/error.types";
import { browser } from "$app/environment";
import toast, { type ToastOptions } from "svelte-french-toast";

interface ErrorState {
	errors: AppError[];
	lastError: AppError | null;
}

const initialState: ErrorState = {
	errors: [],
	lastError: null
};

function createErrorStore() {
	const { subscribe, set, update } = writable<ErrorState>(initialState);

	return {
		subscribe,

		/**
		 * Add an error and show toast notification
		 */
		addError(error: AppError, showToast = true) {
			update((state) => ({
				errors: [...state.errors, error],
				lastError: error
			}));

			if (showToast && browser) {
				this.showToast(error);
			}

			setTimeout(() => {
				this.removeError(error.id);
			}, 30000); // Remove after 30 seconds

			if (browser) {
				console.group(`🚨 ${error.type.toUpperCase()} Error`);
				console.error("Message:", error.message);
				console.error("Context:", error.context);
				if (error.context?.originalError) {
					console.error("Original Error:", error.context.originalError);
				}
				console.groupEnd();
			}
		},

		/**
		 * Remove a specific error by ID
		 */
		removeError(errorId: string) {
			update((state) => ({
				...state,
				errors: state.errors.filter((e) => e.id !== errorId)
			}));
		},

		/**
		 * Clear all errors
		 */
		clearErrors() {
			set(initialState);
		},

		/**
		 * Handle API response errors
		 */
		handleApiError(response: { error?: { message: string; details?: unknown[] } }, context?: Partial<ErrorContext>) {
			if (response.error) {
				const appError = apiErrorToAppError(response as ApiErrorResponse, context);
				this.addError(appError);
				return appError;
			}
			return null;
		},

		/**
		 * Handle network/fetch errors
		 */
		handleNetworkError(error: Error | unknown, context?: Partial<ErrorContext>) {
			const appError = networkErrorToAppError(error, context);
			this.addError(appError);
			return appError;
		},

		/**
		 * Handle unknown errors
		 */
		handleUnknownError(error: unknown, context?: Partial<ErrorContext>) {
			const appError = unknownErrorToAppError(error, context);
			this.addError(appError);
			return appError;
		},

		/**
		 * Show toast notification for error
		 */
		showToast(error: AppError) {
			const message = getErrorDisplayMessage(error);
			const duration = getToastDuration(error.severity);

			const toastOptions: ToastOptions = {
				duration,
				position: "bottom-right",
				style: this.getToastStyle(error.severity),
				ariaProps: {
					role: "alert",
					"aria-live": "assertive"
				}
			};

			switch (error.severity) {
				case ErrorSeverity.LOW:
					toast(message, {
						...toastOptions,
						icon: "ℹ️"
					});
					break;
				case ErrorSeverity.MEDIUM:
					toast.error(message, toastOptions);
					break;
				case ErrorSeverity.HIGH:
				case ErrorSeverity.CRITICAL:
					toast.error(message, {
						...toastOptions,
						icon: "🚨"
					});
					break;
				default:
					toast.error(message, toastOptions);
			}
		},

		/**
		 * Get toast styling based on error severity
		 */
		getToastStyle(severity: ErrorSeverity): string {
			const baseStyle = `
				border-radius: 12px;
				backdrop-filter: blur(16px);
				border: 1px solid;
				font-size: 14px;
				padding: 12px 16px;
				box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
			`;

			switch (severity) {
				case ErrorSeverity.LOW:
					return (
						baseStyle +
						`
						background: rgba(59, 130, 246, 0.15);
						border-color: rgba(59, 130, 246, 0.3);
						color: rgb(147, 197, 253);
					`
					);
				case ErrorSeverity.MEDIUM:
					return (
						baseStyle +
						`
						background: rgba(239, 68, 68, 0.15);
						border-color: rgba(239, 68, 68, 0.3);
						color: rgb(252, 165, 165);
					`
					);
				case ErrorSeverity.HIGH:
				case ErrorSeverity.CRITICAL:
					return (
						baseStyle +
						`
						background: rgba(220, 38, 38, 0.2);
						border-color: rgba(220, 38, 38, 0.4);
						color: rgb(254, 202, 202);
						font-weight: 500;
					`
					);
				default:
					return (
						baseStyle +
						`
						background: rgba(239, 68, 68, 0.15);
						border-color: rgba(239, 68, 68, 0.3);
						color: rgb(252, 165, 165);
					`
					);
			}
		},

		/**
		 * Show success toast
		 */
		showSuccess(message: string) {
			if (!browser) return;

			toast.success(message, {
				duration: 4000,
				position: "bottom-right",
				style: `
					border-radius: 12px;
					backdrop-filter: blur(16px);
					border: 1px solid rgba(34, 197, 94, 0.3);
					background: rgba(34, 197, 94, 0.15);
					color: rgb(134, 239, 172);
					font-size: 14px;
					padding: 12px 16px;
					box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
				`,
				ariaProps: {
					role: "status",
					"aria-live": "polite"
				}
			});
		},

		/**
		 * Show info toast
		 */
		showInfo(message: string) {
			if (!browser) return;

			toast(message, {
				duration: 3000,
				position: "bottom-right",
				icon: "ℹ️",
				style: `
					border-radius: 12px;
					backdrop-filter: blur(16px);
					border: 1px solid rgba(59, 130, 246, 0.3);
					background: rgba(59, 130, 246, 0.15);
					color: rgb(147, 197, 253);
					font-size: 14px;
					padding: 12px 16px;
					box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
				`,
				ariaProps: {
					role: "status",
					"aria-live": "polite"
				}
			});
		}
	};
}

export const errorStore = createErrorStore();

// Derived stores for common error queries
export const hasErrors = derived(errorStore, ($errorStore) => $errorStore.errors.length > 0);
export const criticalErrors = derived(errorStore, ($errorStore) =>
	$errorStore.errors.filter((e) => e.severity === ErrorSeverity.CRITICAL)
);
export const lastError = derived(errorStore, ($errorStore) => $errorStore.lastError);
