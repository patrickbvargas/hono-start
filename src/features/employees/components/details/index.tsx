import { EntityStatus } from "@/shared/components/entity-status";
import { Button, Drawer } from "@/shared/components/ui";
import { formatter } from "@/shared/lib/formatter";
import type { OverlayState } from "@/shared/types/overlay";
import type { Employee } from "../../schemas/model";

interface EmployeeDetailsProps {
	employee: Employee;
	state: OverlayState;
}

interface DetailRowProps {
	label: string;
	value: React.ReactNode;
}

const DetailRow = ({ label, value }: DetailRowProps) => (
	<div className="flex flex-col gap-0.5">
		<span className="text-xs text-fg-muted">{label}</span>
		<span className="text-sm font-medium">{value}</span>
	</div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
	<p className="text-xs font-semibold uppercase tracking-wide text-fg-muted mb-2 mt-4 first:mt-0">
		{children}
	</p>
);

export const EmployeeDetails = ({ employee, state }: EmployeeDetailsProps) => {
	return (
		<Drawer>
			<Drawer.Backdrop isOpen={state.isOpen} onOpenChange={state.onOpenChange}>
				<Drawer.Content placement="right">
					<Drawer.Dialog>
						<Drawer.CloseTrigger />
						<Drawer.Header>
							<Drawer.Heading>{employee.fullName}</Drawer.Heading>
						</Drawer.Header>
						<Drawer.Body>
							<div className="flex flex-col gap-4">
								<div>
									<SectionTitle>Identificação</SectionTitle>
									<div className="flex flex-col gap-3">
										<DetailRow label="E-mail" value={employee.email} />
										<DetailRow
											label="OAB"
											value={formatter.oab(employee.oabNumber)}
										/>
										<DetailRow
											label="Status"
											value={<EntityStatus isActive={employee.isActive} />}
										/>
									</div>
								</div>

								<div>
									<SectionTitle>Cargo & Perfil</SectionTitle>
									<div className="flex flex-col gap-3">
										<DetailRow label="Cargo" value={employee.type} />
										<DetailRow label="Perfil" value={employee.role} />
									</div>
								</div>

								<div>
									<SectionTitle>Financeiro</SectionTitle>
									<div className="flex flex-col gap-3">
										<DetailRow
											label="Remuneração"
											value={formatter.percent(employee.remunerationPercent)}
										/>
										<DetailRow
											label="Indicação"
											value={formatter.percent(employee.referrerPercent)}
										/>
									</div>
								</div>

								<div>
									<SectionTitle>Atividade</SectionTitle>
									<div className="flex flex-col gap-3">
										<DetailRow
											label="Contratos"
											value={employee.contractCount}
										/>
										<DetailRow
											label="Criado em"
											value={formatter.date(employee.createdAt)}
										/>
										<DetailRow
											label="Atualizado em"
											value={formatter.date(employee.updatedAt)}
										/>
									</div>
								</div>
							</div>
						</Drawer.Body>
						<Drawer.Footer>
							<Button slot="close" variant="outline" className="w-full">
								Fechar
							</Button>
						</Drawer.Footer>
					</Drawer.Dialog>
				</Drawer.Content>
			</Drawer.Backdrop>
		</Drawer>
	);
};
