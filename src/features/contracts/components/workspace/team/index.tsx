import { RelatedRecordLink } from "@/features/related-records";
import { FormSection } from "@/shared/components/form-section";
import { Button } from "@/shared/components/ui";
import type { ContractDetail } from "../../../schemas/model";

interface ContractTeamProps {
	assignments: ContractDetail["assignments"];
	canReadEmployees: boolean;
	onEdit?: () => void;
}

export function ContractTeam({
	assignments,
	canReadEmployees,
	onEdit,
}: ContractTeamProps) {
	const visibleAssignments = assignments.filter(
		(assignment) => !assignment.isSoftDeleted,
	);
	return (
		<FormSection title="Equipe do contrato">
			{visibleAssignments.length === 0 ? (
				<p className="text-sm text-muted-foreground">
					Nenhum colaborador vinculado.
				</p>
			) : (
				<div className="min-w-0">
					{visibleAssignments.map((assignment) => (
						<div
							key={assignment.id}
							className="flex min-h-8 min-w-0 flex-wrap items-center justify-between gap-3 py-1"
						>
							<span>
								{canReadEmployees ? (
									<RelatedRecordLink kind="employee" id={assignment.employeeId}>
										{assignment.employeeName}
									</RelatedRecordLink>
								) : (
									assignment.employeeName
								)}
							</span>
							<div className="flex flex-wrap items-center gap-2">
								<span className="text-sm text-muted-foreground">
									{assignment.assignmentType}
								</span>
							</div>
						</div>
					))}
				</div>
			)}
			{onEdit && (
				<Button
					type="button"
					size="sm"
					variant="outline"
					className="w-fit"
					onClick={onEdit}
				>
					Editar equipe
				</Button>
			)}
		</FormSection>
	);
}
