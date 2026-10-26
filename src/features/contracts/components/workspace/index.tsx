import { Link } from "@tanstack/react-router";
import { AttachmentSection } from "@/features/attachments";
import { EntityAuditHistory } from "@/features/audit-logs";
import { FeeForm, feeSearchDefaults } from "@/features/fees";
import { RelatedRecordLink } from "@/features/related-records";
import { remunerationSearchDefaults } from "@/features/remunerations";
import { EntityDetail } from "@/shared/components/entity-detail";
import { EntityStatus } from "@/shared/components/entity-status";
import {
	EntityWorkspace,
	EntityWorkspaceHistory,
} from "@/shared/components/entity-workspace";
import { FormSection } from "@/shared/components/form-section";
import { NavigationLink } from "@/shared/components/navigation-link";
import { Badge, Button } from "@/shared/components/ui";
import { SensitiveValue } from "@/shared/components/value-visibility";
import { formatter } from "@/shared/lib/formatter";
import { hasPermission } from "@/shared/session";
import { useContractWorkspace } from "../../hooks/use-workspace";
import {
	type ContractWorkspaceSearch,
	contractWorkspaceSearchSchema,
} from "../../schemas/workspace";
import { contractSearchDefaults } from "../../utils/default";
import { ContractDelete } from "../delete";
import { ContractRevenues } from "../details/revenues";
import { ContractForm } from "../form";
import { ContractRestore } from "../restore";
import { ContractAlerts } from "./alerts";

interface ContractWorkspaceProps {
	id: number;
	search: ContractWorkspaceSearch;
	onTabChange: (tab: ContractWorkspaceSearch["tab"]) => void;
	onDeleted: () => void;
}
export function ContractWorkspace({
	id,
	search,
	onTabChange,
	onDeleted,
}: ContractWorkspaceProps) {
	const {
		contract,
		alerts,
		session,
		overlay,
		selectedRevenue,
		canReadFees,
		canEdit,
		canDelete,
		canRestore,
		registerReceipt,
	} = useContractWorkspace(id);
	const activeRevenues = contract.revenues.filter(
		(r) => r.isActive && !r.isSoftDeleted,
	);
	const canReadAttachments = hasPermission(session, "org:attachments:read");
	const selected = activeRevenues.find((r) => r.id === selectedRevenue);
	return (
		<EntityWorkspace
			title="Contrato"
			identity={contract.processNumber}
			subtitle={`#${id}`}
			status={
				<>
					<Badge
						variant="secondary"
						aria-label={`Andamento: ${contract.status}`}
					>
						{contract.status}
					</Badge>
					{(!contract.isActive || contract.isSoftDeleted) && (
						<EntityStatus
							isActive={contract.isActive}
							isSoftDeleted={contract.isSoftDeleted}
						/>
					)}
				</>
			}
			returnLink={
				<Link
					to={search.pendingReturnTo ? "/pendencias" : "/contratos"}
					search={
						search.pendingReturnTo ?? search.returnTo ?? contractSearchDefaults
					}
				>
					{search.pendingReturnTo
						? "Voltar para pendências"
						: "Voltar para contratos"}
				</Link>
			}
			tab={
				search.tab === "attachments" && !canReadAttachments
					? "overview"
					: search.tab
			}
			onTabChange={(tab) =>
				onTabChange(contractWorkspaceSearchSchema.shape.tab.parse(tab))
			}
			onEdit={canEdit ? () => overlay.edit.open(id) : undefined}
			onDelete={canDelete ? () => overlay.delete.open(id) : undefined}
			onRestore={canRestore ? () => overlay.restore.open(id) : undefined}
			sections={[
				{
					value: "overview",
					label: "Visão geral",
					content: (
						<>
							<div>
								<FormSection title="Dados do contrato">
									<EntityDetail.Fields
										columns={2}
										items={[
											{
												term: "Cliente",
												definition: hasPermission(
													session,
													"org:clients:read",
												) ? (
													<RelatedRecordLink
														kind="client"
														id={contract.clientId}
													>
														{contract.client}
													</RelatedRecordLink>
												) : (
													contract.client
												),
											},
											{ term: "Área", definition: contract.legalArea },
											{
												term: "Honorários (%)",
												definition: formatter.percent(contract.feePercentage),
											},
											{
												term: "Alteração de status",
												definition: contract.allowStatusChange
													? "Permitida"
													: "Bloqueada",
											},
											{
												term: "Observações",
												definition: contract.notes || "—",
												classNames: {
													item: "col-span-2",
													definition: "whitespace-pre-wrap",
												},
											},
										]}
									/>
								</FormSection>
							</div>
							<div className="mt-5">
								<FormSection title="Alertas">
									<ContractAlerts alerts={alerts} onNavigate={onTabChange} />
								</FormSection>
							</div>
						</>
					),
				},
				{
					value: "finance",
					label: "Financeiro",
					content: (
						<>
							<div className="space-y-5">
								<div className="flex flex-wrap items-center justify-between gap-3">
									<div>
										<h3 className="font-medium">Receitas e recebimentos</h3>
										<p className="text-sm text-muted-foreground">
											Valores previstos, recebidos e em aberto deste contrato.
										</p>
									</div>
									<div className="flex flex-wrap gap-3">
										{canReadFees && (
											<NavigationLink
												to="/honorarios"
												search={{
													...feeSearchDefaults,
													contractId: String(id),
												}}
												className="text-sm underline underline-offset-4"
											>
												Ver recebimentos
											</NavigationLink>
										)}
										{(hasPermission(session, "org:remunerations:read_all") ||
											hasPermission(session, "org:remunerations:read_own")) && (
											<NavigationLink
												to="/remuneracoes"
												search={{
													...remunerationSearchDefaults,
													contractId: String(id),
												}}
												className="text-sm underline underline-offset-4"
											>
												Ver remunerações
											</NavigationLink>
										)}
									</div>
								</div>
								<FormSection title="Financeiro">
									<EntityDetail.Fields
										columns={2}
										items={[
											{
												term: "Valor contratado",
												definition: (
													<SensitiveValue>
														{formatter.currency(
															activeRevenues.reduce(
																(s, r) => s + r.totalValue,
																0,
															),
														)}
													</SensitiveValue>
												),
											},
											{
												term: "Recebido (inclui entrada)",
												definition: (
													<SensitiveValue>
														{formatter.currency(
															activeRevenues.reduce(
																(s, r) => s + r.paidValue,
																0,
															),
														)}
													</SensitiveValue>
												),
											},
											{
												term: "Saldo a receber",
												definition: (
													<SensitiveValue>
														{formatter.currency(
															activeRevenues.reduce(
																(s, r) => s + r.remainingValue,
																0,
															),
														)}
													</SensitiveValue>
												),
											},
										]}
									/>
								</FormSection>
								<ContractRevenues
									contract={contract}
									canReadFees={canReadFees}
									onRegister={registerReceipt}
								/>
							</div>
						</>
					),
				},
				{
					value: "team",
					label: "Equipe",
					content: (
						<>
							<FormSection title="Equipe do contrato">
								{!contract.assignments.some(
									(a) => a.isActive && !a.isSoftDeleted,
								) && (
									<p className="text-sm text-muted-foreground">
										Nenhum colaborador vinculado.
									</p>
								)}
								<div className="divide-y rounded-lg border">
									{contract.assignments
										.filter((a) => a.isActive && !a.isSoftDeleted)
										.map((a) => (
											<div
												key={a.id}
												className="flex flex-wrap justify-between gap-3 p-4"
											>
												<span>
													{hasPermission(session, "org:employees:read") ? (
														<RelatedRecordLink
															kind="employee"
															id={a.employeeId}
														>
															{a.employeeName}
														</RelatedRecordLink>
													) : (
														a.employeeName
													)}
												</span>
												<span className="text-sm text-muted-foreground">
													{a.assignmentType}
												</span>
											</div>
										))}
								</div>
								{canEdit && (
									<Button
										variant="outline"
										className="w-fit"
										onClick={() => overlay.edit.open(id)}
									>
										Editar equipe
									</Button>
								)}
							</FormSection>
						</>
					),
				},
				...(canReadAttachments
					? [
							{
								value: "attachments",
								label: "Anexos",
								expanded: true,
								content: (
									<>
										<AttachmentSection
											canUpload={canEdit}
											layout="expanded"
											ownerId={id}
											ownerKind="contract"
										/>
									</>
								),
							},
						]
					: []),
				{
					value: "history",
					label: "Histórico",
					content: (
						<>
							<EntityWorkspaceHistory
								createdAt={contract.createdAt}
								updatedAt={contract.updatedAt}
							>
								<EntityAuditHistory entityType="Contract" entityId={id} />
							</EntityWorkspaceHistory>
						</>
					),
				},
			]}
		>
			{overlay.edit.render((contractId, state) => (
				<ContractForm id={contractId} state={state} onSuccess={state.close} />
			))}
			{overlay.restore.render((contractId, state) => (
				<ContractRestore
					id={contractId}
					state={state}
					onSuccess={state.close}
				/>
			))}
			{overlay.delete.render((contractId, state) => (
				<ContractDelete
					id={contractId}
					state={state}
					onSuccess={() => {
						state.close();
						onDeleted();
					}}
				/>
			))}
			{overlay.create.render((state) => (
				<FeeForm
					state={state}
					initialSelection={{
						contractId: String(id),
						revenueId: String(selectedRevenue),
						installmentNumber: selected?.nextInstallmentNumber ?? 1,
					}}
					onSuccess={state.close}
				/>
			))}
		</EntityWorkspace>
	);
}
