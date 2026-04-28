import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "@/shared/lib/toast";
import { sessionKeys } from "@/shared/session/api";
import { logoutMutationOptions } from "../api/mutations";

export function useLogout() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const mutation = useMutation(logoutMutationOptions());

	async function handleLogout() {
		try {
			await mutation.mutateAsync({});
			queryClient.removeQueries({
				queryKey: sessionKeys.all,
			});
			await navigate({ to: "/login" });
		} catch (error) {
			toast.danger(
				error instanceof Error
					? error.message
					: "Não foi possível encerrar a sessão.",
			);
		}
	}

	return {
		handleLogout,
		isPending: mutation.isPending,
	};
}
