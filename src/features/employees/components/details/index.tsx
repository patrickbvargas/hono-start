import { CopyIcon } from "lucide-react";
import * as React from "react";
import { EntityActions } from "@/shared/components/entity-actions";
import {
	type DetailFieldItem,
	EntityDetail,
} from "@/shared/components/entity-detail";
import { EntityStatus } from "@/shared/components/entity-status";
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
	DrawerClose,
} from "@/shared/components/ui";
import { formatter } from "@/shared/lib/formatter";
import { toast } from "@/shared/lib/toast";
import type { EntityId } from "@/shared/schemas/entity";
import type { OverlayState } from "@/shared/types/overlay";
import { useEmployee } from "../../hooks/use-data";
import { useEmployeeResetPassword } from "../../hooks/use-reset-password";
import { getEmployeeLifecycleActions } from "../../utils/lifecycle-actions";

interface EmployeeDetailsProps {
	canManageLifecycle?: boolean;
	id: EntityId;
	onDelete?: (id: EntityId) => void;
	onEdit?: (id: EntityId) => void;
	onRestore?: (id: EntityId) => void;
	state: OverlayState;
}

export const EmployeeDetails = ({
	canManageLifecycle = false,
	id,
	onDelete,
	onEdit,
	onRestore,
	state,
}: EmployeeDetailsProps) => {
	return (
		<EntityDetail.Root key={id} state={state}>
			<React.Suspense fallback={<EmployeeDetailsFallback />}>
				<EmployeeDetailsContent
					canManageLifecycle={canManageLifecycle}
					id={id}
					onDelete={onDelete}
					onEdit={onEdit}
					onRestore={onRestore}
				/>
			</React.Suspense>
		</EntityDetail.Root>
	);
};

interface EmployeeDetailsContentProps {
	canManageLifecycle: boolean;
	id: EntityId;
	onDelete?: (id: EntityId) => void;
	onEdit?: (id: EntityId) => void;
	onRestore?: (id: EntityId) => void;
}

const EmployeeDetailsContent = ({
	canManageLifecycle,
	id,
	onDelete,
	onEdit,
	onRestore,
}: EmployeeDetailsContentProps) => {
	const { employee } = useEmployee(id);
	const actions = getEmployeeLifecycleActions({
		canManageLifecycle,
		isSoftDeleted: employee.isSoftDeleted,
	});
	const [isResetDialogOpen, setIsResetDialogOpen] = React.useState(false);
	const [temporaryPassword, setTemporaryPassword] = React.useState<
		string | null
	>(null);
	const { handleConfirm, isPending } = useEmployeeResetPassword();

	const generalInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{ term: "OAB", definition: formatter.oab(employee.oabNumber) },
			{ term: "Cargo", definition: employee.type },
			{ term: "Perfil", definition: employee.role },
			{ term: "Contratos", definition: employee.contractCount },
		],
		[employee],
	);

	const contactInfo = React.useMemo<DetailFieldItem[]>(
		() => [{ term: "Email", definition: employee.email }],
		[employee],
	);

	const accessInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{
				term: "Acesso ao sistema",
				definition: employee.hasCredentialAccount
					? "Disponível"
					: "Não disponível",
			},
			{
				term: "Troca obrigatória",
				definition: employee.mustChangePassword ? "Pendente" : "Não",
			},
		],
		[employee],
	);

	const financialInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{
				term: "Remuneração",
				definition: formatter.percent(employee.remunerationPercent),
			},
		],
		[employee],
	);

	const registerInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{
				term: "Status",
				definition: (
					<EntityStatus
						isActive={employee.isActive}
						isSoftDeleted={employee.isSoftDeleted}
					/>
				),
			},
			{ term: "Criado em", definition: formatter.date(employee.createdAt) },
		],
		[employee],
	);

	const handleResetPassword = async () => {
		const password = await handleConfirm(id);

		if (password) {
			setTemporaryPassword(password);
		}
	};

	const handleResetDialogChange = (isOpen: boolean) => {
		setIsResetDialogOpen(isOpen);

		if (!isOpen) {
			setTemporaryPassword(null);
		}
	};

	const handleCopyPassword = async () => {
		if (!temporaryPassword || !navigator.clipboard) {
			return;
		}

		await navigator.clipboard.writeText(temporaryPassword);
		toast.success("Senha temporária copiada.");
	};

	return (
		<EntityDetail.Content>
			<EntityDetail.Header className="flex-row items-center justify-between gap-3">
				<EntityDetail.Title>{employee.fullName}</EntityDetail.Title>
				<EntityActions
					canView={false}
					canEdit={actions.canEdit}
					canRestore={actions.canRestore}
					canDelete={actions.canDelete}
					onEdit={onEdit ? () => onEdit(id) : undefined}
					onRestore={onRestore ? () => onRestore(id) : undefined}
					onDelete={onDelete ? () => onDelete(id) : undefined}
				/>
			</EntityDetail.Header>
			<EntityDetail.Body>
				<EntityDetail.Fields items={generalInfo} />
				<EntityDetail.Separator />
				<EntityDetail.Section title="Contato">
					<EntityDetail.Fields items={contactInfo} />
				</EntityDetail.Section>
				<EntityDetail.Separator />
				<EntityDetail.Section title="Acesso">
					<EntityDetail.Fields items={accessInfo} />
				</EntityDetail.Section>
				<EntityDetail.Separator />
				<EntityDetail.Section title="Financeiro">
					<EntityDetail.Fields items={financialInfo} />
				</EntityDetail.Section>
				<EntityDetail.Separator />
				<EntityDetail.Section title="Registro">
					<EntityDetail.Fields items={registerInfo} />
				</EntityDetail.Section>
				{temporaryPassword ? (
					<>
						<EntityDetail.Separator />
						<EntityDetail.Section title="Senha temporária">
							<div className="space-y-3 rounded-md border bg-muted/40 p-4">
								<p className="text-sm text-muted-foreground">
									Compartilhe esta senha com {employee.fullName}. Ela será
									exigida no próximo login e deverá ser trocada antes de
									continuar.
								</p>
								<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
									<div className="break-all font-mono text-lg font-semibold tracking-[0.2em]">
										{temporaryPassword}
									</div>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={handleCopyPassword}
									>
										<CopyIcon size={16} />
										Copiar
									</Button>
								</div>
							</div>
						</EntityDetail.Section>
					</>
				) : null}
			</EntityDetail.Body>
			<EntityDetail.Footer>
				<div className="flex w-full flex-col gap-2">
					{employee.hasCredentialAccount && !employee.isSoftDeleted ? (
						<AlertDialog
							open={isResetDialogOpen}
							onOpenChange={handleResetDialogChange}
						>
							<Button
								type="button"
								variant="secondary"
								className="w-full"
								onClick={() => setIsResetDialogOpen(true)}
							>
								Resetar senha
							</Button>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>
										{temporaryPassword
											? "Senha temporária gerada"
											: "Resetar senha"}
									</AlertDialogTitle>
									<AlertDialogDescription>
										{temporaryPassword
											? `Compartilhe esta senha com ${employee.fullName}.`
											: `Gerar nova senha temporária para ${employee.fullName}.`}
									</AlertDialogDescription>
								</AlertDialogHeader>
								{temporaryPassword ? (
									<div className="rounded-md border bg-muted/40 p-4">
										<div className="break-all font-mono text-center text-lg font-semibold tracking-[0.2em]">
											{temporaryPassword}
										</div>
									</div>
								) : null}
								<AlertDialogFooter>
									{temporaryPassword ? (
										<>
											<AlertDialogCancel>Fechar</AlertDialogCancel>
											<AlertDialogAction onClick={handleCopyPassword}>
												<CopyIcon size={16} />
												Copiar senha
											</AlertDialogAction>
										</>
									) : (
										<>
											<AlertDialogCancel disabled={isPending}>
												Cancelar
											</AlertDialogCancel>
											<AlertDialogAction
												onClick={handleResetPassword}
												disabled={isPending}
											>
												{isPending ? "Gerando..." : "Gerar senha temporária"}
											</AlertDialogAction>
										</>
									)}
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					) : null}
					<DrawerClose asChild>
						<Button type="button" variant="outline" className="w-full">
							Fechar
						</Button>
					</DrawerClose>
				</div>
			</EntityDetail.Footer>
		</EntityDetail.Content>
	);
};

const EmployeeDetailsFallback = () => (
	<EntityDetail.Content>
		<EntityDetail.Header>
			<EntityDetail.Title>
				<EntityDetail.SkeletonTitle />
			</EntityDetail.Title>
		</EntityDetail.Header>
		<EntityDetail.Body>
			<EntityDetail.SkeletonFields rows={4} />
			<EntityDetail.Separator />
			<EntityDetail.Section title="Contato">
				<EntityDetail.SkeletonFields rows={1} />
			</EntityDetail.Section>
			<EntityDetail.Separator />
			<EntityDetail.Section title="Acesso">
				<EntityDetail.SkeletonFields rows={2} />
			</EntityDetail.Section>
			<EntityDetail.Separator />
			<EntityDetail.Section title="Financeiro">
				<EntityDetail.SkeletonFields rows={1} />
			</EntityDetail.Section>
			<EntityDetail.Separator />
			<EntityDetail.Section title="Registro">
				<EntityDetail.SkeletonFields rows={2} />
			</EntityDetail.Section>
		</EntityDetail.Body>
		<EntityDetail.Footer />
	</EntityDetail.Content>
);
