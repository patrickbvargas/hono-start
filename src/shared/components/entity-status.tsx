import { cn } from "@/shared/lib/utils";

interface EntityStatusProps {
	status: string;
}

export const EntityStatus = ({ status }: EntityStatusProps) => {
	const isActive = status === "Ativo";
	return (
		<span
			className={cn(
				"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
				isActive
					? "bg-success-soft text-success"
					: "bg-danger-soft text-danger",
			)}
		>
			{status}
		</span>
	);
};
