import { Link } from "@tanstack/react-router";
import { MonitorCogIcon, MoonIcon, SunIcon } from "lucide-react";
import { contractSearchDefaults } from "@/features/contracts";
import { remunerationSearchDefaults } from "@/features/remunerations";
import {
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui";
import { hasPermission, useLoggedUserSession } from "@/shared/session";
import { useSettings } from "../../hooks/use-settings";
import { UserProfileDialog } from "../user-profile-dialog";
export function Settings() {
	const session = useLoggedUserSession();
	const { accountOpen, setAccountOpen, theme, setTheme } = useSettings();
	return (
		<div className="grid gap-4 p-0.5 lg:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle>Meu acesso</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<p className="font-medium">{session.user.fullName}</p>
					<p className="text-sm text-muted-foreground">{session.user.email}</p>
					<p className="text-sm">Escritório: {session.firm.name}</p>
					<Button variant="outline" onClick={() => setAccountOpen(true)}>
						Gerenciar minha conta
					</Button>
					<UserProfileDialog open={accountOpen} onOpenChange={setAccountOpen} />
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>Aparência</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<p className="text-sm text-muted-foreground">
						Preferência aplicada a toda a plataforma neste navegador.
					</p>
					<div className="flex flex-wrap gap-2" role="group" aria-label="Tema">
						{[
							{ value: "system", label: "Sistema", icon: MonitorCogIcon },
							{ value: "light", label: "Claro", icon: SunIcon },
							{ value: "dark", label: "Escuro", icon: MoonIcon },
						].map((item) => (
							<Button
								key={item.value}
								variant={theme === item.value ? "default" : "outline"}
								aria-pressed={theme === item.value}
								onClick={() => setTheme(item.value)}
							>
								<item.icon size={16} aria-hidden="true" />
								{item.label}
							</Button>
						))}
					</div>
				</CardContent>
			</Card>
			<Card className="lg:col-span-2">
				<CardHeader>
					<CardTitle>Como trabalhar no Hono</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4 text-sm">
					<ol className="list-decimal space-y-2 pl-5">
						<li>
							Cadastre o cliente e os colaboradores que participam do contrato.
						</li>
						<li>Crie o contrato, defina a equipe e as receitas previstas.</li>
						<li>
							Abra o contrato e use a aba Financeiro para registrar os
							recebimentos.
						</li>
						<li>
							Confira as remunerações geradas e os indicadores da visão geral.
						</li>
					</ol>
					<p className="text-muted-foreground">
						Receitas são valores previstos. Recebimentos registram entradas
						realizadas. Remunerações geradas não confirmam pagamento ao
						colaborador; saídas são registradas em Despesas.
					</p>
					<div className="flex flex-wrap gap-3">
						{(hasPermission(session, "org:contracts:read_all") ||
							hasPermission(session, "org:contracts:read_assigned")) && (
							<Link
								to="/contratos"
								search={contractSearchDefaults}
								className="underline underline-offset-4"
							>
								Ir para contratos
							</Link>
						)}
						{(hasPermission(session, "org:remunerations:read_all") ||
							hasPermission(session, "org:remunerations:read_own")) && (
							<Link
								to="/remuneracoes"
								search={remunerationSearchDefaults}
								className="underline underline-offset-4"
							>
								Conferir e exportar remunerações
							</Link>
						)}
					</div>
					<p className="text-muted-foreground">
						Colaboradores representam a equipe de trabalho. Contas e permissões
						de acesso são administradas separadamente pelo responsável pela
						plataforma.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
