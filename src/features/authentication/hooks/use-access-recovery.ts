import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "@/shared/lib/toast";

export function useAccessRecovery() {
	const queryClient = useQueryClient();
	const router = useRouter();
	const [isPending, setIsPending] = useState(false);
	async function handleRetry() {
		setIsPending(true);
		try {
			await queryClient.cancelQueries();
			queryClient.clear();
			await router.invalidate();
		} catch {
			toast.danger("Não foi possível verificar o acesso. Tente novamente.");
		} finally {
			setIsPending(false);
		}
	}
	return { handleRetry, isPending };
}
