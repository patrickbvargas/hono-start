import { useDebouncedCallback } from "use-debounce";
import { useAppForm } from "@/shared/hooks/use-app-form";
import { useFilter } from "@/shared/hooks/use-filter";
import { type DashboardFilter, dashboardFilterSchema } from "../schemas/filter";
import {
	type DashboardPeriodShortcutId,
	getDashboardPeriodShortcutById,
	getDashboardPeriodShortcuts,
} from "../utils/period-shortcuts";

const DEBOUNCED_FIELDS = new Set<keyof DashboardFilter>([]);
const SHORTCUT_FIELD_UPDATE_OPTIONS = {
	dontRunListeners: true,
	dontValidate: true,
} as const;

export function useDashboardFilter() {
	const { filter, handleFilter, hasNonDefaultFilter } = useFilter(
		dashboardFilterSchema,
	);
	const periodShortcuts = getDashboardPeriodShortcuts();

	const debounceSubmit = useDebouncedCallback(
		(submit: () => void | Promise<void>) => submit(),
		300,
	);

	const form = useAppForm({
		defaultValues: filter,
		onSubmit: ({ value }) => {
			const payload = dashboardFilterSchema.parse(value);
			handleFilter(payload);
		},
		listeners: {
			onChange: ({ formApi, fieldApi }) => {
				if (DEBOUNCED_FIELDS.has(fieldApi.name)) {
					debounceSubmit(formApi.handleSubmit);
					return;
				}

				debounceSubmit.cancel();
				formApi.handleSubmit();
			},
			onBlur: ({ fieldApi }) => {
				if (DEBOUNCED_FIELDS.has(fieldApi.name)) {
					debounceSubmit.flush();
				}
			},
		},
	});

	const handlePeriodShortcut = (
		shortcutId: DashboardPeriodShortcutId,
		referenceDate = new Date(),
	) => {
		const shortcut = getDashboardPeriodShortcutById(shortcutId, referenceDate);

		form.setFieldValue(
			"dateFrom",
			shortcut.dateFrom,
			SHORTCUT_FIELD_UPDATE_OPTIONS,
		);
		form.setFieldValue(
			"dateTo",
			shortcut.dateTo,
			SHORTCUT_FIELD_UPDATE_OPTIONS,
		);
		void form.handleSubmit();
	};

	return { form, handlePeriodShortcut, periodShortcuts, hasNonDefaultFilter };
}
