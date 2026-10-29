import {
	OrganizationList,
	RedirectToTasks,
	Show,
	SignIn,
} from "@clerk/tanstack-react-start";
import type { SessionAccess } from "@/shared/session";
import { useLogin } from "../../hooks/use-login";
import { AccessRecovery } from "../access-recovery";
import { ClerkStatus } from "../clerk-status";

interface LoginFormProps {
	redirectTo?: string;
	access?: SessionAccess;
	selectOrganization?: boolean;
}

export function LoginForm({
	redirectTo,
	access,
	selectOrganization = false,
}: LoginFormProps) {
	const {
		orgId,
		destination,
		afterSignInUrl,
		hasConfigurationIssue,
		hasPendingTask,
		isTaskLocationReady,
		shouldRedirectToTasks,
	} = useLogin(redirectTo, access);
	return (
		<ClerkStatus>
			{hasPendingTask ? (
				!isTaskLocationReady ? (
					<p role="status">Verificando tarefas de acesso...</p>
				) : shouldRedirectToTasks ? (
					<RedirectToTasks redirectUrl={afterSignInUrl} />
				) : (
					<SignIn routing="hash" forceRedirectUrl={afterSignInUrl} />
				)
			) : (
				<>
					<Show when="signed-out">
						<SignIn routing="hash" forceRedirectUrl={afterSignInUrl} />
					</Show>
					<Show when="signed-in">
						<div className="flex w-full max-w-sm flex-col gap-4">
							{orgId && !selectOrganization && access?.status !== "ready" ? (
								<AccessRecovery
									issues={
										access?.status === "configuration_required"
											? access.issues
											: undefined
									}
								/>
							) : null}
							{selectOrganization || !hasConfigurationIssue ? (
								<OrganizationList
									hidePersonal
									afterSelectOrganizationUrl={destination}
								/>
							) : null}
						</div>
					</Show>
				</>
			)}
		</ClerkStatus>
	);
}
