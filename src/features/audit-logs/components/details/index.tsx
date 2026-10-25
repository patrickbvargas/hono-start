import * as React from "react";
import { EntityDetail } from "@/shared/components/entity-detail";
import { Skeleton } from "@/shared/components/ui";
import type { EntityId } from "@/shared/schemas/entity";
import type { OverlayState } from "@/shared/types/overlay";
import { useAuditLog } from "../../hooks/use-data";
import { getAuditLogTitle } from "../../utils/display";

import { AuditLogOverview } from "./overview";

interface AuditLogDetailsProps {
	id: EntityId;
	state: OverlayState;
}

export const AuditLogDetails = ({ id, state }: AuditLogDetailsProps) => {
	return (
		<EntityDetail.Root key={id} state={state}>
			<React.Suspense fallback={<AuditLogDetailsFallback />}>
				<AuditLogDetailsContent id={id} />
			</React.Suspense>
		</EntityDetail.Root>
	);
};

function AuditLogDetailsContent({ id }: { id: EntityId }) {
	const { auditLog } = useAuditLog(id);
	return (
		<EntityDetail.Content>
			<EntityDetail.Header>
				<EntityDetail.Title>{getAuditLogTitle(auditLog)}</EntityDetail.Title>
			</EntityDetail.Header>
			<EntityDetail.Body>
				<AuditLogOverview id={id} />
			</EntityDetail.Body>
			<EntityDetail.Footer />
		</EntityDetail.Content>
	);
}

const AuditLogDetailsFallback = () => (
	<EntityDetail.Content>
		<EntityDetail.SkeletonHeader />
		<EntityDetail.Body>
			<EntityDetail.SkeletonFields columns={2} rows={10} />
			<EntityDetail.Separator />
			<section className="flex flex-col gap-2">
				<Skeleton className="h-3 w-28" />
				<EntityDetail.SkeletonFields columns={2} rows={4} />
			</section>
			<EntityDetail.Separator />
			<section className="flex flex-col gap-2">
				<Skeleton className="h-3 w-28" />
				<div className="rounded-md border bg-muted/30 p-3">
					<div className="flex flex-col gap-2">
						<Skeleton className="h-3 w-full" />
						<Skeleton className="h-3 w-full" />
						<Skeleton className="h-3 w-5/6" />
						<Skeleton className="h-3 w-2/3" />
					</div>
				</div>
			</section>
		</EntityDetail.Body>
		<EntityDetail.Footer />
	</EntityDetail.Content>
);
