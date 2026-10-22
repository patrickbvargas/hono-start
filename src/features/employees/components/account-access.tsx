import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	Button,
} from "@/shared/components/ui";
import { useEmployeeAccountAccess } from "../hooks/use-account-access";
import type { EmployeeDetail } from "../schemas/model";

interface EmployeeAccountAccessProps {
	employee: EmployeeDetail;
}

export function EmployeeAccountAccess({
	employee,
}: EmployeeAccountAccessProps) {
	const {
		allowed,
		roles,
		role,
		setRole,
		revokeOpen,
		setRevokeOpen,
		grant,
		revoke,
		handleRevoke,
		handleGrant,
	} = useEmployeeAccountAccess(employee);
	if (!allowed) {
		return null;
	}

	return (
		<div className="flex flex-col gap-3">
			<p>
				Permissões seguem o perfil selecionado. Recuperação de senha disponível
				na tela de acesso.
			</p>
			<label htmlFor={`clerk-role-${employee.id}`}>Perfil de acesso</label>
			<select
				id={`clerk-role-${employee.id}`}
				value={role}
				onChange={(event) => setRole(event.target.value)}
				className="rounded-md border p-2"
			>
				<option value="">Selecione um perfil</option>
				{roles.data?.map((item) => (
					<option key={item.value} value={item.value}>
						{item.label}
					</option>
				))}
			</select>
			<Button
				disabled={!role || !employee.isActive || grant.isPending}
				onClick={handleGrant}
			>
				{employee.hasActiveCredentialAccess
					? "Atualizar perfil"
					: "Enviar convite de acesso"}
			</Button>
			<Button
				variant="destructive"
				disabled={revoke.isPending}
				onClick={() => setRevokeOpen(true)}
			>
				Revogar acesso
			</Button>
			<AlertDialog open={revokeOpen} onOpenChange={setRevokeOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Revogar acesso</AlertDialogTitle>
						<AlertDialogDescription>
							Remover o acesso de {employee.fullName} a esta firma e cancelar
							convites pendentes?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancelar</AlertDialogCancel>
						<AlertDialogAction
							disabled={revoke.isPending}
							onClick={handleRevoke}
						>
							Revogar acesso
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
