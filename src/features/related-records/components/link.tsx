import { CatchBoundary } from "@tanstack/react-router";
import { lazy, type ReactNode, Suspense } from "react";
import { EntityDetail } from "@/shared/components/entity-detail";
import { useOverlay } from "@/shared/hooks/use-overlay";
import type { EntityId } from "@/shared/schemas/entity";
import type { RelatedRecordKind } from "../schemas/record";

const RelatedRecordDetails = lazy(() =>
	import("./details").then((module) => ({
		default: module.RelatedRecordDetails,
	})),
);

interface RelatedRecordLinkProps {
	kind: RelatedRecordKind;
	id: EntityId;
	children: ReactNode;
}

export function RelatedRecordLink({
	kind,
	id,
	children,
}: RelatedRecordLinkProps) {
	const { overlay } = useOverlay<EntityId>();
	return (
		<>
			<button
				type="button"
				aria-haspopup="dialog"
				aria-expanded={overlay.details.isOpen}
				onClick={() => overlay.details.open(id)}
				className="inline-flex max-w-full cursor-pointer items-baseline rounded-sm text-left underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			>
				<span className="min-w-0 wrap-break-word">{children}</span>
			</button>
			{overlay.details.render((selectedId, state) => (
				<CatchBoundary
					getResetKey={() => kind + selectedId}
					errorComponent={() => (
						<EntityDetail.Root state={state}>
							<EntityDetail.Content>
								<EntityDetail.Header>
									<EntityDetail.Title>Detalhes</EntityDetail.Title>
								</EntityDetail.Header>
								<EntityDetail.Body>
									Não foi possível carregar este registro.
								</EntityDetail.Body>
								<EntityDetail.Footer />
							</EntityDetail.Content>
						</EntityDetail.Root>
					)}
				>
					<Suspense
						fallback={
							<EntityDetail.Root state={state}>
								<EntityDetail.Content>
									<EntityDetail.SkeletonHeader />
									<EntityDetail.Body>
										<EntityDetail.SkeletonFields columns={2} rows={4} />
									</EntityDetail.Body>
									<EntityDetail.Footer />
								</EntityDetail.Content>
							</EntityDetail.Root>
						}
					>
						<RelatedRecordDetails kind={kind} id={selectedId} state={state} />
					</Suspense>
				</CatchBoundary>
			))}
		</>
	);
}
