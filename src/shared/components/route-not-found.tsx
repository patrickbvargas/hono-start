import { Link } from "@tanstack/react-router";
import { CompassIcon, HomeIcon } from "lucide-react";
import { buttonVariants } from "@/shared/components/ui";
import { ROUTES } from "@/shared/config/routes";

export function RouteNotFound() {
	return (
		<div className="flex min-h-full w-full items-center justify-center px-6 py-10">
			<div className="flex w-full max-w-2xl flex-col items-center text-center">
				<div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-muted text-foreground">
					<CompassIcon className="size-7" />
				</div>
				<div className="space-y-3">
					<h2 className="font-heading text-2xl font-semibold tracking-tight">
						Página não encontrada
					</h2>
					<p className="mx-auto max-w-xl text-sm leading-6 text-muted-foreground">
						O endereço informado não existe ou não está mais disponível.
					</p>
				</div>
				<div className="mt-8 flex flex-col gap-3 sm:flex-row">
					<Link
						to={ROUTES.dashboard.url}
						className={buttonVariants({ size: "lg" })}
					>
						<HomeIcon />
						Ir para o início
					</Link>
					<Link
						to="/login"
						className={buttonVariants({ variant: "outline", size: "lg" })}
					>
						Fazer login
					</Link>
				</div>
			</div>
		</div>
	);
}
