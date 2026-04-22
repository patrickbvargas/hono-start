import { Badge } from "@/shared/components/ui";

const STATUS_CONFIG = {
	active: {
		variant: "secondary",
		label: "Ativo",
	},
	inactive: {
		variant: "outline",
		label: "Inativo",
	},
	deleted: {
		variant: "destructive",
		label: "Excluído",
	},
} as const;

interface EntityStatusProps {
	isActive: boolean;
	isSoftDeleted?: boolean;
}

export const EntityStatus = ({
	isActive,
	isSoftDeleted,
}: EntityStatusProps) => {
	const status = isSoftDeleted
		? STATUS_CONFIG.deleted
		: isActive
			? STATUS_CONFIG.active
			: STATUS_CONFIG.inactive;

	return <Badge variant={status.variant}>{status.label}</Badge>;
};
