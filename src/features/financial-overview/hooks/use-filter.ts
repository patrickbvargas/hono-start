import { useDebouncedCallback } from "use-debounce";
import { useAppForm } from "@/shared/hooks/use-app-form";
import { useFilter } from "@/shared/hooks/use-filter";
import {
	type FinancialOverviewSearch,
	financialOverviewSearchSchema,
} from "../schemas/search";
import {
	type FinancialPeriodShortcutId,
	getFinancialActivePeriodShortcut,
	getFinancialPeriodShortcutById,
	getFinancialPeriodShortcuts,
} from "../utils/period-shortcuts";

const SHORTCUT_FIELD_UPDATE_OPTIONS = {
	dontRunListeners: true,
	dontValidate: true,
} as const;

export function useFinancialOverviewFilter() {
	const {
		filter,
		defaultFilter,
		handleFilter,
		handleResetFilter,
		canClearFilters,
		hasNonDefaultFilter,
	} = useFilter(financialOverviewSearchSchema);

	const periodShortcuts = getFinancialPeriodShortcuts();
	const activePeriodShortcut = getFinancialActivePeriodShortcut({
		dateFrom: filter.dateFrom,
		dateTo: filter.dateTo,
	});

	const hasManualPeriod =
		activePeriodShortcut === null &&
		(filter.dateFrom !== defaultFilter.dateFrom ||
			filter.dateTo !== defaultFilter.dateTo);

	const hasAdvancedFilters =
		hasManualPeriod ||
		Boolean(filter.analytic) ||
		(filter.paymentMethods && filter.paymentMethods.length > 0) ||
		(filter.kinds && filter.kinds.length > 0) ||
		(filter.legalAreas && filter.legalAreas.length > 0);

	const DEBOUNCED_FIELDS = new Set<keyof FinancialOverviewSearch>([]);
	const debounceSubmit = useDebouncedCallback(
		(submit: () => void | Promise<void>) => submit(),
		300,
	);

	const form = useAppForm({
		defaultValues: filter,
		onSubmit: ({ value }) => {
			const payload = financialOverviewSearchSchema.parse(value);
			handleFilter(payload);
		},
		listeners: {
			onChange: ({ formApi, fieldApi }) => {
				if (
					DEBOUNCED_FIELDS.has(fieldApi.name as keyof FinancialOverviewSearch)
				) {
					debounceSubmit(formApi.handleSubmit);
					return;
				}

				debounceSubmit.cancel();
				formApi.handleSubmit();
			},
			onBlur: ({ fieldApi }) => {
				if (
					DEBOUNCED_FIELDS.has(fieldApi.name as keyof FinancialOverviewSearch)
				) {
					debounceSubmit.flush();
				}
			},
		},
	});

	const handlePeriodShortcut = (
		shortcutId: FinancialPeriodShortcutId,
		referenceDate = new Date(),
	) => {
		const shortcut = getFinancialPeriodShortcutById(shortcutId, referenceDate);

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

	const handleApplyFilter = (value: FinancialOverviewSearch) => {
		debounceSubmit.cancel();
		form.reset(value);
		handleFilter(value);
	};

	const handleClearAdvancedFilters = () => {
		debounceSubmit.cancel();

		const nextFilter: FinancialOverviewSearch = {
			...filter,
			analytic: defaultFilter.analytic,
			paymentMethods: defaultFilter.paymentMethods,
			kinds: defaultFilter.kinds,
			legalAreas: defaultFilter.legalAreas,
			categories: defaultFilter.categories,
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
