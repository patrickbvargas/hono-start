import { CatchBoundary } from "@tanstack/react-router";
import { RelatedRecordDetails } from "@/features/related-records";
import { EntityDetail } from "@/shared/components/entity-detail";
import type { OverlayState } from "@/shared/types/overlay";
import type { DashboardRecordTarget } from "../../schemas/drilldown";

interface DashboardRecordSummaryProps {
	record: DashboardRecordTarget;
	state: OverlayState;
}

export function DashboardRecordSummary({
	record,
	state,
}: DashboardRecordSummaryProps) {
	return (
		<CatchBoundary
			getResetKey={() => `${record.kind}:${record.id}`}
			errorComponent={() => (
				<EntityDetail.Root state={state}>
					<EntityDetail.Header>
						<EntityDetail.Title>Resumo</EntityDetail.Title>
					</EntityDetail.Header>
					<EntityDetail.Body>
						Não foi possível carregar este registro.
					</EntityDetail.Body>
					<EntityDetail.Footer />
				</EntityDetail.Root>
			)}
		>
			<RelatedRecordDetails kind={record.kind} id={record.id} state={state} />
		</CatchBoundary>
	);
}
