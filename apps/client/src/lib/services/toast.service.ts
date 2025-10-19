import { browser } from "$app/environment";
import toast, { type ToastOptions } from "svelte-french-toast";

export type ToastType = "success" | "error" | "info" | "warning";

class ToastService {
	private readonly defaultDuration: number = 4230;
	private readonly defaultPosition: ToastOptions["position"] = "bottom-right";

	public success(message: string, options?: ToastOptions): void {
		this.show(message, "success", options);
	}

	public error(message: string, options?: ToastOptions): void {
		this.show(message, "error", options);
	}

	public info(message: string, options?: ToastOptions): void {
		this.show(message, "info", options);
	}

	public warning(message: string, options?: ToastOptions): void {
		this.show(message, "warning", options);
	}

	private show(message: string, type: ToastType, options?: ToastOptions): void {
		if (!browser) return;

		const style = this.getToastStyle(type);
		const toastOptions: ToastOptions = {
			duration: this.defaultDuration,
			...options,
			position: this.defaultPosition,
			style,
			ariaProps: this.getAriaProps(type)
		};

		switch (type) {
			case "success":
				toast.success(message, toastOptions);
				break;
			case "error":
				toast.error(message, toastOptions);
				break;
			case "warning":
				toast(message, toastOptions);
				break;
			case "info":
			default:
				toast(message, toastOptions);
				break;
		}
	}

	private getToastStyle(type: ToastType): string {
		const baseStyle = `
			border-radius: 12px;
			backdrop-filter: blur(16px);
			border: 1px solid;
			font-size: 14px;
			padding: 12px 16px;
			box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
		`;

		switch (type) {
			case "success":
				return (
					baseStyle +
					`
					background: rgba(34, 197, 94, 0.15);
					border-color: rgba(34, 197, 94, 0.3);
					color: rgb(134, 239, 172);
				`
				);
			case "info":
				return (
					baseStyle +
					`
					background: rgba(59, 130, 246, 0.15);
					border-color: rgba(59, 130, 246, 0.3);
					color: rgb(147, 197, 253);
				`
				);
			case "warning":
				return (
					baseStyle +
					`
					background: rgba(245, 158, 11, 0.15);
					border-color: rgba(245, 158, 11, 0.3);
					color: rgb(253, 230, 138);
				`
				);
			case "error":
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
	}

	private getAriaProps(type: ToastType): { role: "status" | "alert"; "aria-live": "assertive" | "off" | "polite" } {
		switch (type) {
			case "error":
				return {
					role: "alert",
					"aria-live": "assertive"
				};
			case "success":
			case "info":
			case "warning":
			default:
				return {
					role: "status",
					"aria-live": "polite"
				};
		}
	}
}

export const toastService = new ToastService();
