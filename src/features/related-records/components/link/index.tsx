import { CatchBoundary } from "@tanstack/react-router";
import { lazy, type ReactNode, Suspense, useRef } from "react";
import { EntityDetail } from "@/shared/components/entity-detail";
import { TableButton } from "@/shared/components/table-button";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuTrigger,
} from "@/shared/components/ui";
import { useOverlay } from "@/shared/hooks/use-overlay";
import type { EntityId } from "@/shared/schemas/entity";
import { useRecordPage } from "../../hooks/use-record-page";
import type { RelatedRecordKind } from "../../schemas/record";
import { RelatedRecordActions } from "../actions";

type RelatedRecordPrimaryAction = "summary" | "page";

// Change this default to switch primary clicks across all related links.
const DEFAULT_PRIMARY_ACTION: RelatedRecordPrimaryAction = "summary";

const RelatedRecordDetails = lazy(() =>
	import("../details").then((module) => ({
		default: module.RelatedRecordDetails,
	})),
);

interface RelatedRecordLinkProps {
	kind: RelatedRecordKind;
	id: EntityId;
	children: ReactNode;
	variant?: "default" | "table";
	primaryAction?: RelatedRecordPrimaryAction;
}

export function RelatedRecordLink({
	kind,
	id,
	children,
	variant = "default",
	primaryAction = DEFAULT_PRIMARY_ACTION,
}: RelatedRecordLinkProps) {
	const { overlay } = useOverlay<EntityId>();
	const { openPage } = useRecordPage(kind, id);
	const triggerRef = useRef<HTMLElement | null>(null);
	const Trigger = variant === "table" ? TableButton : "button";
	const opensSummary = primaryAction === "summary";
	const actionLabel = opensSummary ? "Ver resumo" : "Abrir página";
	return (
		<>
			<ContextMenu>
				<ContextMenuTrigger
					ref={(element) => {
						triggerRef.current = element;
					}}
					onContextMenu={(event) => event.stopPropagation()}
					render={
						<Trigger
							type="button"
							aria-haspopup={opensSummary ? "dialog" : undefined}
							title={
								typeof children === "string"
									? `${actionLabel} de ${children}`
									: actionLabel
							}
							aria-expanded={opensSummary ? overlay.details.isOpen : undefined}
							onClick={(event) => {
								event.stopPropagation();
								if (opensSummary) {
									overlay.details.open(id);
								} else {
									void openPage();
								}
							}}
							className={
								variant === "table"
									? "inline-flex max-w-full items-baseline"
									: "inline-flex max-w-full cursor-pointer items-baseline rounded-sm text-left underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							}
						>
							<span className="min-w-0 wrap-break-word">{children}</span>
						</Trigger>
					}
					onKeyDown={(event) => {
						if (
							event.key === "ContextMenu" ||
							(event.shiftKey && event.key === "F10")
						) {
							event.preventDefault();
							event.stopPropagation();
							const rect = event.currentTarget.getBoundingClientRect();
							event.currentTarget.dispatchEvent(
								new MouseEvent("contextmenu", {
									bubbles: true,
									cancelable: true,
									clientX: rect.left + 16,
									clientY: rect.bottom,
								}),
							);
						}
					}}
				/>
				<ContextMenuContent finalFocus={() => triggerRef.current}>
					<RelatedRecordActions
						presentation="context"
						kind={kind}
						id={id}
						onOpenPage={() => {
							void openPage();
						}}
						onView={() => overlay.details.open(id)}
					/>
				</ContextMenuContent>
			</ContextMenu>
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
					{/* Entity details own the drawer and its data-loading skeleton. */}
					<Suspense fallback={null}>
						<RelatedRecordDetails kind={kind} id={selectedId} state={state} />
					</Suspense>
				</CatchBoundary>
			))}
		</>
	);
}
