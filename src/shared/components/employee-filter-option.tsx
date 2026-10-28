import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui";
import type { FieldOption } from "@/shared/types/field";

export function renderEmployeeFilterAvatar(option: FieldOption) {
	const initials = option.label
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? "")
		.join("");

	return (
		<Avatar key={option.imageUrl ?? option.value} size="sm" aria-hidden="true">
			<AvatarImage src={option.imageUrl} alt="" />
			<AvatarFallback>{initials}</AvatarFallback>
		</Avatar>
	);
}

export function renderEmployeeFilterOption(option: FieldOption) {
	return (
		<span className="flex min-w-0 items-center gap-2">
			{renderEmployeeFilterAvatar(option)}
			<span className="truncate">{option.label}</span>
		</span>
	);
}
