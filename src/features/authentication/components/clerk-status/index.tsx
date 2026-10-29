import {
	ClerkDegraded,
	ClerkFailed,
	ClerkLoaded,
	ClerkLoading,
} from "@clerk/tanstack-react-start";
import type { ReactNode } from "react";
import { Button } from "@/shared/components/ui";

interface ClerkStatusProps {
	children?: ReactNode;
	loadingFallback?: ReactNode;
}

export function ClerkStatus({ children, loadingFallback }: ClerkStatusProps) {
	return (
		<>
			<ClerkLoading>
				{loadingFallback ?? (
					<p role="status" className="text-sm text-muted-foreground">
						Carregando acesso...
					</p>
				)}
			</ClerkLoading>
			<ClerkFailed>
				<div role="alert" className="flex flex-col gap-2 text-sm">
					<p>Não foi possível carregar o serviço de acesso.</p>
					<Button
						type="button"
						size="sm"
						variant="outline"
						onClick={() => window.location.reload()}
					>
						Recarregar página
					</Button>
				</div>
			</ClerkFailed>
			<ClerkDegraded>
				<p role="status" className="text-sm text-muted-foreground">
					Serviço de acesso parcialmente indisponível. Algumas ações podem
					falhar.
				</p>
			</ClerkDegraded>
			<ClerkLoaded>{children}</ClerkLoaded>
		</>
	);
}
