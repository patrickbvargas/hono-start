import { useSearch } from "@tanstack/react-router";
import { Suspense } from "react";
import { AttachmentSectionFallback } from "@/features/attachments";
import { EntityDetail } from "@/shared/components/entity-detail";
import { NavigationLink } from "@/shared/components/navigation-link";
import { SensitiveValue } from "@/shared/components/value-visibility";
import { formatter } from "@/shared/lib/formatter";
import { hasPermission, useLoggedUserSession } from "@/shared/session";
import type { OverlayState } from "@/shared/types/overlay";
import { useReceivable } from "../../hooks/use-data";
import { receivableSearchSchema } from "../../schemas/search";
import { ReceivableOverview } from "./overview";

interface ReceivableDetailsProps {
	id: number;
	state: OverlayState;
}
export function ReceivableDetails({ id, state }: ReceivableDetailsProps) {
	return (
		<EntityDetail.Root key={id} state={state}>
			<Suspense fallback={<ReceivableDetailsFallback />}>
				<ReceivableDetailsContent id={id} />
			</Suspense>
		</EntityDetail.Root>
	);
}
interface ReceivableDetailsContentProps {
	id: number;
}
function ReceivableDetailsContent({ id }: ReceivableDetailsContentProps) {
	const { receivable } = useReceivable(id);
	const currentSearch = useSearch({ strict: false });
	const workspaceLink = (
		<NavigationLink
			to="/contas-a-receber/$receivableId"
			params={{ receivableId: String(id) }}
			search={{
				tab: "overview",
				returnTo: receivableSearchSchema.parse(currentSearch),
			}}
			className="inline-flex items-center gap-1 text-xs font-medium"
		>
			Abrir página
		</NavigationLink>
	);
	return (
		<EntityDetail.Content>
			<EntityDetail.Header className="flex-row items-center justify-between gap-3">
				<EntityDetail.Title className="min-w-0 flex-1 truncate">
					{receivable.debtorName} •{" "}
					<SensitiveValue>
						{formatter.currency(receivable.amount)}
					</SensitiveValue>
				</EntityDetail.Title>
				<div className="hidden shrink-0 sm:block">{workspaceLink}</div>
			</EntityDetail.Header>
			<EntityDetail.Body>
				<div className="sm:hidden">{workspaceLink}</div>
				<ReceivableOverview id={id} />
			</EntityDetail.Body>
			<EntityDetail.Footer />
		</EntityDetail.Content>
	);
}
function ReceivableDetailsFallback() {
	const session = useLoggedUserSession();
	return (
		<EntityDetail.Content>
			<EntityDetail.SkeletonHeader withPageLink />
			<EntityDetail.Body>
				<EntityDetail.SkeletonPageLink />
				<EntityDetail.SkeletonFields columns={2} rows={7} />
				<EntityDetail.Separator />
				<EntityDetail.Section title="Observações">
					<EntityDetail.SkeletonFields rows={1} />
				</EntityDetail.Section>
				{hasPermission(session, "org:attachments:read") ? (
					<>
						<EntityDetail.Separator />
						<AttachmentSectionFallback canUpload={false} />
					</>
				) : null}
				<EntityDetail.Separator />
				<EntityDetail.Section title="Registro">
					<EntityDetail.SkeletonFields columns={2} rows={2} />
				</EntityDetail.Section>
			</EntityDetail.Body>
			<EntityDetail.Footer />
		</EntityDetail.Content>
	);
}
