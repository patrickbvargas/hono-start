import { Link } from "@tanstack/react-router";
import { CompassIcon } from "lucide-react";
import { RouteFeedback } from "@/shared/components/route-feedback";
import { buttonVariants } from "@/shared/components/ui";
import { ROUTES } from "@/shared/config/routes";

export function RouteNotFound() {
	return (
		<RouteFeedback
			eyebrow="Página indisponível"
			heading="Não encontramos o caminho que você tentou abrir."
			description="O endereço pode ter mudado ou não existe mais. Volte ao início para continuar navegando pelo sistema."
			watermark="404"
			icon={<CompassIcon className="size-12" />}
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
}
