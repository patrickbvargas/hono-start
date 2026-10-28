import type { FieldOption } from "@/shared/types/field";

export function renderContractFilterOption(option: FieldOption) {
	const [contract, ...client] = option.label.split(" • ");
	return (
		<span className="flex min-w-0 flex-col gap-0.5">
			<span className="whitespace-nowrap font-medium">{contract}</span>
			{client.length > 0 && (
				<span className="text-xs text-muted-foreground">
					{client.join(" • ")}
				</span>
			)}
		</span>
	);
}
