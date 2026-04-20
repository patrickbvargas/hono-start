import { Chip } from "@/shared/components/ui";

const STATUS_CONFIG = {
	active: { color: "success", label: "Ativo" },
	inactive: { color: "warning", label: "Inativo" },
	deleted: { color: "danger", label: "Excluído" },
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

	return <Chip color={status.color}>{status.label}</Chip>;
};
