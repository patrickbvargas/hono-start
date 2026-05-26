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
<<<<<<< HEAD
		<div className="flex min-h-full w-full items-center justify-center px-6 py-10">
			<div className="flex w-full max-w-2xl flex-col items-center text-center">
				<div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
					<AlertCircleIcon className="size-7" />
				</div>
				<div className="space-y-3">
					<h2 className="font-heading text-2xl font-semibold tracking-tight">
						Algo deu errado
					</h2>
					<p className="mx-auto max-w-xl text-sm leading-6 text-muted-foreground">
						Não foi possível carregar esta tela no momento.
					</p>
				</div>
				<div className="mt-6 w-full max-w-xl rounded-2xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
					{message}
				</div>
				<div className="mt-8">
					<Link
						to={ROUTES.dashboard.url}
						className={buttonVariants({ variant: "outline", size: "lg" })}
					>
						<HomeIcon />
						Voltar para o início
					</Link>
				</div>
			</div>
		</div>
=======
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
>>>>>>> 82ed7464ba9ae0d00ffdb2109f60889930dd5295
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
