import { Button } from "@/shared/components/ui";
import type { SessionConfigurationIssue } from "@/shared/session";
import { useAccessRecovery } from "../../hooks/use-access-recovery";
import { useLogout } from "../../hooks/use-logout";

const CONFIGURATION_MESSAGES: Record<SessionConfigurationIssue, string> = {
	employee_missing: "Vínculo do usuário ausente: employeeId é obrigatório.",
	employee_invalid:
		"Vínculo do usuário inválido: employeeId deve ser um número inteiro positivo.",
	employee_unavailable:
		"Vínculo do usuário indisponível: employeeId deve identificar um colaborador existente e ativo, que não tenha sido excluído.",
	firm_missing: "Vínculo da organização ausente: firmId é obrigatório.",
	firm_invalid:
		"Vínculo da organização inválido: firmId deve ser um número inteiro positivo.",
	firm_unavailable:
		"Vínculo da organização indisponível: firmId deve identificar uma unidade existente.",
};

interface AccessRecoveryProps {
	issues?: SessionConfigurationIssue[];
}

export function AccessRecovery({ issues }: AccessRecoveryProps) {
	const { handleRetry, isPending } = useAccessRecovery();
	const { handleLogout, isPending: isLoggingOut } = useLogout();
	return (
		<div className="flex flex-col gap-4">
			{issues ? (
				<div
					role="alert"
					className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm"
				>
					<h1 className="font-semibold">Configuração de acesso incompleta</h1>
					<ul className="mt-3 list-disc space-y-2 pl-4">
						{issues.map((issue) => (
							<li key={issue}>{CONFIGURATION_MESSAGES[issue]}</li>
						))}
					</ul>
					<p className="mt-3 text-muted-foreground">
						Peça ao administrador para corrigir os campos em privateMetadata no
						Clerk. Esses vínculos são obrigatórios para acessar o sistema.
					</p>
				</div>
			) : (
				<p role="alert" className="text-center text-sm text-muted-foreground">
					Não foi possível carregar a unidade selecionada. Peça ao administrador
					para conferir a configuração da unidade ou selecione outra
					organização.
				</p>
			)}
			<div className="flex flex-wrap justify-center gap-2">
				<Button
					type="button"
					variant="outline"
					size="sm"
					disabled={isPending || isLoggingOut}
					onClick={handleRetry}
				>
					{isPending ? "Verificando acesso..." : "Tentar novamente"}
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					disabled={isPending || isLoggingOut}
					onClick={handleLogout}
				>
					{isLoggingOut ? "Saindo..." : "Sair"}
				</Button>
			</div>
		</div>
	);
}
