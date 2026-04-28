export const AUTHENTICATION_ERRORS = {
	INVALID_CREDENTIALS: "Email, OAB ou senha inválidos.",
	TOO_MANY_ATTEMPTS:
		"Muitas tentativas em pouco tempo. Tente novamente em instantes.",
	LOGIN_FAILED: "Não foi possível concluir o login.",
	LOGOUT_FAILED: "Não foi possível encerrar a sessão.",
	RESET_REQUEST_FAILED:
		"Não foi possível iniciar a recuperação de senha neste momento.",
	RESET_INVALID_TOKEN: "O link de redefinição é inválido ou expirou.",
	RESET_FAILED: "Não foi possível redefinir a senha.",
} as const;
