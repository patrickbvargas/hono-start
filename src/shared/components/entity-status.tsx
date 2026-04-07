import { Chip } from "@heroui/react";

interface EntityStatusProps {
	status: string;
}

export const EntityStatus = ({ status }: EntityStatusProps) => {
	const isActive = status === "Ativo";

	return <Chip color={isActive ? "success" : "danger"}>{status}</Chip>;
};
