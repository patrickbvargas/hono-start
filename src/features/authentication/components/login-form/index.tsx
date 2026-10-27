import { OrganizationList, SignIn, useAuth } from "@clerk/tanstack-react-start";
import { getSafeInternalRedirectPath } from "@/shared/session/client";

interface LoginFormProps {
	redirectTo?: string;
}

export function LoginForm({ redirectTo }: LoginFormProps) {
	const { isLoaded, isSignedIn, orgId } = useAuth();
	if (!isLoaded) {
		return null;
	}
	const destination = getSafeInternalRedirectPath(redirectTo) ?? "/";
	return (
		<>
			{!isSignedIn ? (
				<SignIn routing="hash" forceRedirectUrl={destination} />
			) : null}
			{isSignedIn ? (
				<div className="flex max-w-sm flex-col gap-4">
					{orgId ? (
						<p
							role="alert"
							className="text-center text-sm text-muted-foreground"
						>
							Não foi possível carregar a unidade selecionada. Peça ao
							administrador para conferir a configuração da unidade ou selecione
							outra organização.
						</p>
					) : null}
					<OrganizationList
						hidePersonal
						afterSelectOrganizationUrl={destination}
					/>
				</div>
			) : null}
		</>
	);
}
