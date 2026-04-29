import { Link } from "@tanstack/react-router";
import { AlertCircleIcon, HomeIcon } from "lucide-react";
import { buttonVariants } from "@/shared/components/ui";
import { ROUTES } from "@/shared/config/routes";

interface RouteErrorProps {
	error: unknown;
}

export const RouteError = ({ error }: RouteErrorProps) => {
	const message =
		error instanceof Error ? error.message : "Ocorreu um erro inesperado.";

	return (
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
						Voltar ao início
					</Link>
				</div>
			</div>
		</div>
	);
};
