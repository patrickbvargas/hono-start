import { Link } from "@tanstack/react-router";
import { AlertCircleIcon } from "lucide-react";
import { RouteFeedback } from "@/shared/components/route-feedback";
import { Button, buttonVariants } from "@/shared/components/ui";
import { useRouteRecovery } from "@/shared/hooks/use-route-recovery";

interface RouteErrorProps {
	error: unknown;
	title?: string;
}

export const RouteError = ({ error, title }: RouteErrorProps) => {
	const content = getRouteErrorContent(error);
	const { retry, isRetrying } = useRouteRecovery();

	return (
		<RouteFeedback
			title={title}
			eyebrow={content.eyebrow}
			heading={content.heading}
			description={content.description}
			watermark="OPS"
			icon={<AlertCircleIcon className="size-12" />}
			actions={
				<>
					<Button size="sm" onClick={() => void retry()} disabled={isRetrying}>
						{isRetrying ? "Tentando novamente…" : "Tentar novamente"}
					</Button>
					<Link to="/configuracoes" className={buttonVariants({ size: "sm" })}>
						Abrir configurações
					</Link>
				</>
			}
		/>
	);
};

function getRouteErrorContent(error: unknown) {
	if (!(error instanceof Error)) {
		return {
			eyebrow: "Falha temporária",
			heading: "Não foi possível abrir esta tela.",
			description:
				"Tente carregar novamente ou abra Configurações para verificar seu acesso.",
		};
	}

	const normalizedMessage = error.message.toLowerCase();

	if (
		normalizedMessage.includes("sess") ||
		normalizedMessage.includes("login") ||
		normalizedMessage.includes("autentic")
	) {
		return {
			eyebrow: "Sessão interrompida",
			heading: "Sua sessão precisa ser renovada.",
			description:
				"Tente carregar novamente. Se necessário, renove seu acesso em Configurações.",
		};
	}

	if (
		normalizedMessage.includes("permiss") ||
		normalizedMessage.includes("acesso") ||
		normalizedMessage.includes("apenas")
	) {
		return {
			eyebrow: "Acesso restrito",
			heading: "Esta área não está disponível para o seu perfil.",
			description:
				"Abra Configurações para verificar o perfil e a organização selecionados.",
		};
	}

	if (
		normalizedMessage.includes("network") ||
		normalizedMessage.includes("fetch") ||
		normalizedMessage.includes("conex") ||
		normalizedMessage.includes("carregar")
	) {
		return {
			eyebrow: "Falha temporária",
			heading: "Não conseguimos carregar esta tela agora.",
			description:
				"Tente carregar novamente. Se o problema continuar, abra Configurações para verificar seu acesso.",
		};
	}

	return {
		eyebrow: "Falha temporária",
		heading: "Não foi possível abrir esta tela.",
		description:
			"Tente carregar novamente ou abra Configurações para verificar seu acesso.",
	};
}
