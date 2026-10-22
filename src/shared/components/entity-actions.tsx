import { EllipsisVerticalIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
	Button,
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
	viewPermission?: ClerkPermission | readonly ClerkPermission[];
	editPermission?: ClerkPermission | readonly ClerkPermission[];
	restorePermission?: ClerkPermission | readonly ClerkPermission[];
	deletePermission?: ClerkPermission | readonly ClerkPermission[];
	canView?: boolean;
	canEdit?: boolean;
	canRestore?: boolean;
	canDelete?: boolean;
	onView?: () => void;
	onEdit?: () => void;
	onRestore?: () => void;
	onDelete?: () => void;
}

export function EntityActions({
	viewPermission,
	editPermission,
	restorePermission,
	deletePermission,
	canView = true,
	canEdit = false,
	canRestore = false,
	canDelete = false,
	onView,
	onEdit,
	onRestore,
	onDelete,
}: EntityActionsProps): ReactNode {
	const session = useOptionalLoggedUserSession();
	const allowed = (
		permission?: ClerkPermission | readonly ClerkPermission[],
	) => {
		if (!permission) return true;
		return typeof permission === "string"
			? hasPermission(session, permission)
			: permission.some((key) => hasPermission(session, key));
	};
	const shouldShowView = canView && !!onView && allowed(viewPermission);
	const shouldShowEdit = canEdit && !!onEdit && allowed(editPermission);
	const shouldShowRestore =
		canRestore && !!onRestore && allowed(restorePermission);
	const shouldShowDelete = canDelete && !!onDelete && allowed(deletePermission);

	if (
		!shouldShowView &&
		!shouldShowEdit &&
		!shouldShowRestore &&
		!shouldShowDelete
	) {
		return null;
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={<Button size="icon-sm" variant="ghost" aria-label="Ações" />}
				className="cursor-pointer"
			>
				<EllipsisVerticalIcon size={16} />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{shouldShowView && (
					<DropdownMenuItem onClick={onView}>Ver detalhes</DropdownMenuItem>
				)}
				{shouldShowEdit && (
					<DropdownMenuItem onClick={onEdit}>Editar</DropdownMenuItem>
				)}
				{shouldShowRestore && (
					<DropdownMenuItem onClick={onRestore}>Restaurar</DropdownMenuItem>
				)}
				{shouldShowDelete && (
					<DropdownMenuItem variant="destructive" onClick={onDelete}>
						Excluir
					</DropdownMenuItem>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
