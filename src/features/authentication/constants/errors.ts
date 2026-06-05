export const AUTHENTICATION_ERRORS = {
	INVALID_CREDENTIALS: "Email, OAB ou senha inválidos.",
	ACCESS_REVOKED:
		"Seu acesso ao sistema foi revogado. Entre em contato com um administrador.",
	LOGIN_FAILED: "Não foi possível concluir o login.",
	LOGOUT_FAILED: "Não foi possível encerrar a sessão.",
	CHANGE_PASSWORD_INVALID_CURRENT: "A senha atual informada é inválida.",
	CHANGE_PASSWORD_FAILED: "Não foi possível alterar a senha.",
	FORCED_CHANGE_PASSWORD_FORBIDDEN:
		"Sua conta não exige redefinição obrigatória de senha.",
	RESET_REQUEST_FAILED:
		"Não foi possível iniciar a recuperação de senha neste momento.",
	RESET_INVALID_TOKEN: "O link de redefinição é inválido ou expirou.",
	RESET_FAILED: "Não foi possível redefinir a senha.",
} as const;
