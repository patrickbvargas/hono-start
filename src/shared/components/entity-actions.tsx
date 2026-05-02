import { EllipsisVerticalIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/shared/components/ui";

interface EntityActionsProps {
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
	canView = true,
	canEdit = false,
	canRestore = false,
	canDelete = false,
	onView,
	onEdit,
	onRestore,
	onDelete,
}: EntityActionsProps): ReactNode {
	const shouldShowView = canView && !!onView;
	const shouldShowEdit = canEdit && !!onEdit;
	const shouldShowRestore = canRestore && !!onRestore;
	const shouldShowDelete = canDelete && !!onDelete;

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
			>
				<EllipsisVerticalIcon size={16} />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{shouldShowView && (
					<DropdownMenuItem onClick={onView}>Visualizar</DropdownMenuItem>
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
