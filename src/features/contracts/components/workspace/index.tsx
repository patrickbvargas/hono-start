import { Link } from "@tanstack/react-router";
import { AttachmentSection } from "@/features/attachments";
import { EntityAuditHistory } from "@/features/audit-logs";
import { FeeForm, feeSearchDefaults } from "@/features/fees";
import { RelatedRecordLink } from "@/features/related-records";
import { remunerationSearchDefaults } from "@/features/remunerations";
import { EntityDetail } from "@/shared/components/entity-detail";
import { EntityStatus } from "@/shared/components/entity-status";
import { FormSection } from "@/shared/components/form-section";
import {
	Badge,
	Button,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/shared/components/ui";
import { Wrapper, WrapperBody } from "@/shared/components/wrapper";
import { formatter } from "@/shared/lib/formatter";
import { hasPermission } from "@/shared/session";
import { useContractWorkspace } from "../../hooks/use-workspace";
import type { ContractWorkspaceSearch } from "../../schemas/workspace";
import { contractSearchDefaults } from "../../utils/default";
import { ContractDelete } from "../delete";
import { ContractRevenues } from "../details/revenues";
import { ContractForm } from "../form";
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
		registerReceipt,
	} = useContractWorkspace(id);
	const activeRevenues = contract.revenues.filter(
		(r) => r.isActive && !r.isSoftDeleted,
	);
	const selected = activeRevenues.find((r) => r.id === selectedRevenue);
	return (
		<Wrapper
			title="Contrato"
			actions={
				<div className="flex flex-wrap gap-2">
					{canEdit && (
						<Button variant="outline" onClick={() => overlay.edit.open(id)}>
							Editar contrato
						</Button>
					)}
					{canDelete && (
						<Button
							variant="destructive"
							onClick={() => overlay.delete.open(id)}
						>
							Excluir contrato
						</Button>
					)}
				</div>
			}
		>
			<WrapperBody
				className={
					search.tab === "attachments"
						? "gap-5 overflow-hidden"
						: "overflow-y-auto gap-5"
				}
			>
				<Link
					to={search.pendingReturnTo ? "/pendencias" : "/contratos"}
					search={
						search.pendingReturnTo ?? search.returnTo ?? contractSearchDefaults
					}
					className="w-fit shrink-0 text-sm underline underline-offset-4"
				>
					{search.pendingReturnTo
						? "Voltar para pendências"
						: "Voltar para contratos"}
				</Link>
				<div className="flex shrink-0 flex-wrap items-start justify-between gap-3">
					<div className="min-w-0 space-y-1">
						<h2 className="break-words text-xl font-semibold">
							{contract.processNumber}
						</h2>
						<p className="text-muted-foreground">
							{contract.client} · {contract.legalArea}
						</p>
					</div>
					<div className="flex items-center gap-3">
						<Badge variant="secondary">{contract.status}</Badge>
						{!contract.isActive || contract.isSoftDeleted ? (
							<EntityStatus
								isActive={contract.isActive}
								isSoftDeleted={contract.isSoftDeleted}
							/>
						) : null}
					</div>
				</div>
				<Tabs
					value={search.tab}
					onValueChange={(value) =>
						onTabChange(value as ContractWorkspaceSearch["tab"])
					}
					className={
						search.tab === "attachments" ? "min-h-0 flex-1 gap-5" : "gap-5"
					}
				>
					<div className="shrink-0 overflow-x-auto overflow-y-hidden pb-1">
						<TabsList aria-label="Seções do contrato">
							{[
								["overview", "Visão geral"],
								["finance", "Financeiro"],
								["team", "Equipe"],
								["attachments", "Anexos"],
								["history", "Histórico"],
							].map(([value, label]) => (
								<TabsTrigger key={value} value={value}>
									{label}
								</TabsTrigger>
							))}
						</TabsList>
					</div>
					<TabsContent value="overview">
						<div className="max-w-3xl">
							<FormSection title="Dados do contrato">
								<EntityDetail.Fields
									columns={2}
									items={[
										{
											term: "Cliente",
											definition: hasPermission(session, "org:clients:read") ? (
												<RelatedRecordLink kind="client" id={contract.clientId}>
													{contract.client}
												</RelatedRecordLink>
											) : (
												contract.client
											),
										},
										{ term: "Área", definition: contract.legalArea },
										{ term: "Andamento", definition: contract.status },
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
											term: "Criado em",
											definition: formatter.date(contract.createdAt),
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
					</TabsContent>
					<TabsContent value="finance">
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
										<Link
											to="/honorarios"
											search={{ ...feeSearchDefaults, contractId: String(id) }}
											className="text-sm underline underline-offset-4"
										>
											Ver recebimentos
										</Link>
									)}
									{(hasPermission(session, "org:remunerations:read_all") ||
										hasPermission(session, "org:remunerations:read_own")) && (
										<Link
											to="/remuneracoes"
											search={{
												...remunerationSearchDefaults,
												contractId: String(id),
											}}
											className="text-sm underline underline-offset-4"
										>
											Conferir remunerações
										</Link>
									)}
								</div>
							</div>
							<ContractRevenues
								contract={contract}
								canReadFees={canReadFees}
								onRegister={registerReceipt}
							/>
						</div>
					</TabsContent>
					<TabsContent value="team">
						<FormSection title="Equipe do contrato">
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
													<RelatedRecordLink kind="employee" id={a.employeeId}>
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
					</TabsContent>
					<TabsContent value="attachments" className="min-h-0 overflow-hidden">
						<AttachmentSection
							canUpload
							layout="expanded"
							ownerId={id}
							ownerKind="contract"
						/>
					</TabsContent>
					<TabsContent value="history">
						<FormSection title="Histórico do contrato">
							<EntityAuditHistory entityType="Contract" entityId={id} />
						</FormSection>
					</TabsContent>
				</Tabs>
				{overlay.edit.render((contractId, state) => (
					<ContractForm id={contractId} state={state} onSuccess={state.close} />
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
			</WrapperBody>
		</Wrapper>
	);
}
