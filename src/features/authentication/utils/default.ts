import type {
	ChangePasswordInput,
	ForcedChangePasswordInput,
	LoginInput,
	PasswordResetCompleteInput,
	PasswordResetRequestInput,
} from "../schemas/form";

export const defaultLoginValues = (): LoginInput => ({
	identifier: "",
	password: "",
	rememberMe: false,
});

export const defaultPasswordResetRequestValues =
	(): PasswordResetRequestInput => ({
		identifier: "",
	});

export const defaultPasswordResetCompleteValues = (
	code: string,
): PasswordResetCompleteInput => ({
	code,
	newPassword: "",
	confirmPassword: "",
});

export const defaultChangePasswordValues = (): ChangePasswordInput => ({
	currentPassword: "",
	newPassword: "",
	confirmPassword: "",
	revokeOtherSessions: true,
});

export const defaultForcedChangePasswordValues =
	(): ForcedChangePasswordInput => ({
		newPassword: "",
		confirmPassword: "",
		revokeOtherSessions: true,
	});
