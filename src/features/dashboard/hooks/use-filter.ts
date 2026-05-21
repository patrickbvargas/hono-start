import { useDebouncedCallback } from "use-debounce";
import { useAppForm } from "@/shared/hooks/use-app-form";
import { useFilter } from "@/shared/hooks/use-filter";
import { type DashboardFilter, dashboardFilterSchema } from "../schemas/filter";
import {
	type DashboardPeriodShortcutId,
	getDashboardActivePeriodShortcut,
	getDashboardPeriodShortcutById,
	getDashboardPeriodShortcuts,
} from "../utils/period-shortcuts";

const SHORTCUT_FIELD_UPDATE_OPTIONS = {
	dontRunListeners: true,
	dontValidate: true,
} as const;

export function useDashboardFilter() {
	const {
		filter,
		defaultFilter,
		handleFilter,
		handleResetFilter,
		canClearFilters,
		hasNonDefaultFilter,
	} = useFilter(dashboardFilterSchema);
	const periodShortcuts = getDashboardPeriodShortcuts();
	const activePeriodShortcut = getDashboardActivePeriodShortcut({
		dateFrom: filter.dateFrom,
		dateTo: filter.dateTo,
	});
	const hasManualPeriod =
		activePeriodShortcut === null &&
		(filter.dateFrom !== defaultFilter.dateFrom ||
			filter.dateTo !== defaultFilter.dateTo);
	const hasAdvancedFilters =
		hasManualPeriod ||
		filter.legalArea.length > 0 ||
		filter.revenueType.length > 0;

	const DEBOUNCED_FIELDS = new Set<keyof DashboardFilter>([]);
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

	const handleApplyFilter = (value: DashboardFilter) => {
		debounceSubmit.cancel();
		form.reset(value);
		handleFilter(value);
	};

	const handleClearAdvancedFilters = () => {
		debounceSubmit.cancel();

		const nextFilter: DashboardFilter = {
			...filter,
			legalArea: defaultFilter.legalArea,
			revenueType: defaultFilter.revenueType,
			...(activePeriodShortcut === null
				? {
						dateFrom: defaultFilter.dateFrom,
						dateTo: defaultFilter.dateTo,
					}
				: {}),
		};

		form.reset(nextFilter);
		handleFilter(nextFilter);
	};

	const handleClearFilters = () => {
		debounceSubmit.cancel();
		form.reset(defaultFilter);
		handleResetFilter();
	};

	return {
		filter,
		defaultFilter,
		form,
		periodShortcuts,
		activePeriodShortcut,
		hasManualPeriod,
		hasAdvancedFilters,
		hasNonDefaultFilter,
		canClearFilters: canClearFilters(),
		canClearAdvancedFilters: hasAdvancedFilters,
		handleApplyFilter,
		handleClearAdvancedFilters,
		handleClearFilters,
		handlePeriodShortcut,
	};
}
