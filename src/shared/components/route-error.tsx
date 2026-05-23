import { Link } from "@tanstack/react-router";
import { AlertCircleIcon } from "lucide-react";
import { RouteFeedback } from "@/shared/components/route-feedback";
import { buttonVariants } from "@/shared/components/ui";
import { ROUTES } from "@/shared/config/routes";

interface RouteErrorProps {
	error: unknown;
	title?: string;
}

export const RouteError = ({ error, title }: RouteErrorProps) => {
	const content = getRouteErrorContent(error);

	return (
		<RouteFeedback
			title={title}
			eyebrow={content.eyebrow}
			heading={content.heading}
			description={content.description}
			watermark="OPS"
			icon={<AlertCircleIcon className="size-12" />}
			actions={
				<Link
					to={ROUTES.dashboard.url}
					className={buttonVariants({ size: "lg" })}
				>
					Voltar ao início
				</Link>
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
				"Houve um problema ao carregar este conteúdo. Volte ao início para continuar usando o sistema.",
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
				"Volte ao início para entrar novamente e continuar de onde parou.",
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
			description: "Volte ao início para seguir por outra parte do sistema.",
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
				"Isso costuma se resolver em instantes. Você pode voltar ao início e tentar novamente depois.",
		};
	}

	return {
		eyebrow: "Falha temporária",
		heading: "Não foi possível abrir esta tela.",
		description:
			"Houve um problema ao carregar este conteúdo. Volte ao início para continuar usando o sistema.",
	};
}
