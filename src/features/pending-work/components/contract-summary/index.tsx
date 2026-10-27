import { CatchBoundary } from "@tanstack/react-router";
import { Suspense } from "react";
import { RelatedRecordDetails } from "@/features/related-records";
import { EntityDetail } from "@/shared/components/entity-detail";
import type { OverlayState } from "@/shared/types/overlay";

interface PendingWorkContractSummaryProps {
	id: number;
	state: OverlayState;
}

export function PendingWorkContractSummary({
	id,
	state,
}: PendingWorkContractSummaryProps) {
	return (
		<CatchBoundary
			getResetKey={() => String(id)}
			errorComponent={() => (
				<EntityDetail.Root state={state}>
					<EntityDetail.Header>
						<EntityDetail.Title>Resumo do contrato</EntityDetail.Title>
					</EntityDetail.Header>
					<EntityDetail.Body>
						Não foi possível carregar este contrato.
					</EntityDetail.Body>
					<EntityDetail.Footer />
				</EntityDetail.Root>
			)}
		>
			<Suspense fallback={null}>
				<RelatedRecordDetails kind="contract" id={id} state={state} />
			</Suspense>
		</CatchBoundary>
	);
}
