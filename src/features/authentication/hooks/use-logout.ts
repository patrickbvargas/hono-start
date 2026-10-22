import { useClerk } from "@clerk/tanstack-react-start";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "@/shared/lib/toast";

export function useLogout() {
	const { signOut } = useClerk();
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const [isPending, setIsPending] = useState(false);
	async function handleLogout() {
		setIsPending(true);
		try {
			await queryClient.cancelQueries();
			queryClient.clear();
			await signOut();
			await navigate({ to: "/login" });
		} catch {
			toast.danger("Não foi possível encerrar a sessão.");
		} finally {
			setIsPending(false);
		}
	}
	return { handleLogout, isPending };
}
