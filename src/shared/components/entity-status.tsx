import { Chip } from "@heroui/react";

interface EntityStatusProps {
	isActive: boolean;
}

export const EntityStatus = ({ isActive }: EntityStatusProps) => {
	return (
		<Chip color={isActive ? "success" : "danger"}>
			{isActive ? "Ativo" : "Inativo"}
		</Chip>
	);
};
