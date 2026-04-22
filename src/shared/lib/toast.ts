import { toast as sonnerToast } from "sonner";

export const toast = Object.assign(sonnerToast, {
	danger: sonnerToast.error,
});

export const toastQueue = {
	add: sonnerToast,
};
