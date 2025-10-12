import type { ApiErrorResponse, AppError, ErrorContext } from "$lib/types/error.types";
import { ErrorSeverity, ErrorType } from "$lib/types/error.types";

/**
 * Generate a unique error ID
 */
function generateErrorId(): string {
	return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a standardized AppError object
 */
export function createError(
	type: ErrorType,
	message: string,
	options: {
		severity?: ErrorSeverity;
		description?: string;
		context?: ErrorContext;
		retryable?: boolean;
		suggestions?: string[];
	} = {}
): AppError {
	return {
		id: generateErrorId(),
		type,
		severity: options.severity || ErrorSeverity.MEDIUM,
		message,
		description: options.description,
		context: options.context,
		timestamp: new Date(),
		retryable: options.retryable || false,
		suggestions: options.suggestions || []
	};
}

/**
 * Convert API error response to AppError
 */
export function apiErrorToAppError(apiError: ApiErrorResponse, context?: Partial<ErrorContext>): AppError {
	const statusCode = context?.statusCode;

	let errorType = ErrorType.API;
	let severity = ErrorSeverity.MEDIUM;
	let suggestions: string[] = [];

	if (statusCode) {
		switch (statusCode) {
			case 400:
				errorType = ErrorType.VALIDATION;
				suggestions = ["Please check your input and try again."];
				break;
			case 401:
				errorType = ErrorType.UNAUTHORIZED;
				severity = ErrorSeverity.HIGH;
				suggestions = ["Please log in again."];
				break;
			case 403:
				errorType = ErrorType.FORBIDDEN;
				severity = ErrorSeverity.HIGH;
				suggestions = ["You may need additional permissions."];
				break;
			case 404:
				errorType = ErrorType.NOT_FOUND;
				suggestions = ["The requested resource could not be found."];
				break;
			case 429:
				errorType = ErrorType.RATE_LIMIT;
				suggestions = ["Please wait a moment before trying again."];
				break;
			case 500:
			case 502:
			case 503:
			case 504:
				severity = ErrorSeverity.HIGH;
				suggestions = ["This appears to be a server issue. Please try again later."];
				break;
		}
	}

	return createError(errorType, apiError.error.message, {
		severity,
		context: {
			statusCode,
			...context
		},
		retryable: statusCode ? [408, 429, 500, 502, 503, 504].includes(statusCode) : false,
		suggestions
	});
}

/**
 * Convert network/fetch errors to AppError
 */
export function networkErrorToAppError(error: Error | unknown, context?: Partial<ErrorContext>): AppError {
	const message = error instanceof Error ? error.message : "Network connection failed";

	return createError(ErrorType.NETWORK, message, {
		severity: ErrorSeverity.MEDIUM,
		context: {
			...context,
			originalError: error
		},
		retryable: true,
		suggestions: [
			"Check your internet connection.",
			"Try refreshing the page.",
			"The server might be temporarily unavailable."
		]
	});
}

/**
 * Convert unknown errors to AppError
 */
export function unknownErrorToAppError(error: unknown, context?: Partial<ErrorContext>): AppError {
	const message = error instanceof Error ? error.message : "An unexpected error occurred";

	return createError(ErrorType.UNKNOWN, message, {
		severity: ErrorSeverity.MEDIUM,
		context: {
			...context,
			originalError: error
		},
		suggestions: ["Try refreshing the page.", "If the problem persists, please contact support."]
	});
}

/**
 * Get user-friendly error message with context
 */
export function getErrorDisplayMessage(error: AppError): string {
	let message = error.message;

	if (error.type === ErrorType.NETWORK) {
		message = "Connection failed. " + message;
	} else if (error.type === ErrorType.RATE_LIMIT) {
		message = "Too many requests. " + message;
	} else if (error.type === ErrorType.UNAUTHORIZED) {
		message = "Authentication required. " + message;
	}

	return message;
}

/**
 * Get appropriate toast duration based on error severity
 */
export function getToastDuration(severity: ErrorSeverity): number {
	switch (severity) {
		case ErrorSeverity.LOW:
			return 3000; // 3 seconds
		case ErrorSeverity.MEDIUM:
			return 5000; // 5 seconds
		case ErrorSeverity.HIGH:
			return 8000; // 8 seconds
		case ErrorSeverity.CRITICAL:
			return 0; // Manual dismiss only
		default:
			return 5000;
	}
}
