import { EllipsisVerticalIcon } from "lucide-react";
import type { ReactNode } from "react";
import { TableButton } from "@/shared/components/table-button";
import {
	ContextMenuItem,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/shared/components/ui";
import {
	type ClerkPermission,
	hasPermission,
	useOptionalLoggedUserSession,
} from "@/shared/session";

interface EntityActionsProps {
	presentation?: "dropdown" | "context";
	viewPermission?: ClerkPermission | readonly ClerkPermission[];
	editPermission?: ClerkPermission | readonly ClerkPermission[];
	restorePermission?: ClerkPermission | readonly ClerkPermission[];
	deletePermission?: ClerkPermission | readonly ClerkPermission[];
	canView?: boolean;
	canEdit?: boolean;
	canRestore?: boolean;
	canDelete?: boolean;
	onOpenPage?: () => void;
	openPageLabel?: string;
	onView?: () => void;
	onEdit?: () => void;
	onRestore?: () => void;
	onDelete?: () => void;
}

export function EntityActions({
	presentation = "dropdown",
	viewPermission,
	editPermission,
	restorePermission,
	deletePermission,
	canView = true,
	canEdit = false,
	canRestore = false,
	canDelete = false,
	onOpenPage,
	openPageLabel = "Abrir página",
	onView,
	onEdit,
	onRestore,
	onDelete,
}: EntityActionsProps): ReactNode {
	const session = useOptionalLoggedUserSession();
	const allowed = (
		permission?: ClerkPermission | readonly ClerkPermission[],
	) => {
		if (!permission) {
			return true;
		}
		return typeof permission === "string"
			? hasPermission(session, permission)
			: permission.some((key) => hasPermission(session, key));
	};
	const shouldShowOpenPage = canView && !!onOpenPage && allowed(viewPermission);
	const shouldShowView = canView && !!onView && allowed(viewPermission);
	const shouldShowEdit = canEdit && !!onEdit && allowed(editPermission);
	const shouldShowRestore =
		canRestore && !!onRestore && allowed(restorePermission);
	const shouldShowDelete = canDelete && !!onDelete && allowed(deletePermission);

	if (
		!shouldShowOpenPage &&
		!shouldShowView &&
		!shouldShowEdit &&
		!shouldShowRestore &&
		!shouldShowDelete
	) {
		return null;
	}

	const Item = presentation === "context" ? ContextMenuItem : DropdownMenuItem;
	const items = (
		<>
			{shouldShowOpenPage && <Item onClick={onOpenPage}>{openPageLabel}</Item>}
			{shouldShowView && <Item onClick={onView}>Ver resumo</Item>}
			{shouldShowEdit && <Item onClick={onEdit}>Editar</Item>}
			{shouldShowRestore && <Item onClick={onRestore}>Restaurar</Item>}
			{shouldShowDelete && (
				<Item variant="destructive" onClick={onDelete}>
					Excluir
				</Item>
			)}
		</>
	);
	if (presentation === "context") {
		return items;
	}
	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<TableButton
						className="mx-0 inline-flex size-7 items-center justify-center px-0"
						aria-label="Ações"
					/>
				}
				className="cursor-pointer"
			>
				<EllipsisVerticalIcon size={16} />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">{items}</DropdownMenuContent>
		</DropdownMenu>
	);
}
