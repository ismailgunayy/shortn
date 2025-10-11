// Error types and interfaces for centralized error handling

export enum ErrorType {
	// API related errors
	API = "api",
	NETWORK = "network",
	VALIDATION = "validation",

	// Auth related errors
	AUTH = "auth",
	UNAUTHORIZED = "unauthorized",
	FORBIDDEN = "forbidden",

	// Application errors
	NOT_FOUND = "not_found",
	RATE_LIMIT = "rate_limit",

	// Generic errors
	UNKNOWN = "unknown",
	CLIENT = "client"
}

export enum ErrorSeverity {
	LOW = "low", // Info/warning messages
	MEDIUM = "medium", // Standard errors
	HIGH = "high", // Critical errors
	CRITICAL = "critical" // System-breaking errors
}

export interface ErrorContext {
	source?: string;
	action?: string;
	metadata?: Record<string, unknown>;
	statusCode?: number;
	originalError?: Error | unknown;
}

export interface AppError {
	id: string;
	type: ErrorType;
	severity: ErrorSeverity;
	message: string;
	description?: string;
	context?: ErrorContext;
	timestamp: Date;
	retryable?: boolean;
	suggestions?: string[];
}

export interface ValidationFieldError {
	field: string;
	message: string;
}

export interface ApiErrorResponse {
	success: false;
	error: {
		message: string;
		details?: ValidationFieldError[];
	};
}
