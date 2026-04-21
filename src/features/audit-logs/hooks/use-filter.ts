import { useAppForm } from "@/shared/hooks/use-app-form";
import { useFilter } from "@/shared/hooks/use-filter";
import { auditLogFilterSchema } from "../schemas/filter";

export function useAuditLogFilter() {
	const { filter, handleFilter } = useFilter(auditLogFilterSchema);

	const form = useAppForm({
		defaultValues: filter,
		onSubmit: ({ value }) => {
			const payload = auditLogFilterSchema.parse(value);
			handleFilter(payload);
		},
		listeners: {
			onChange: ({ formApi }) => {
				formApi.handleSubmit();
			},
		},
	});

	return { form };
}
