import type { ExpenseCategory } from "@/generated/prisma/client";
import { EXPENSE_ERRORS } from "../constants/errors";

export function assertExpenseCategoryExists(
	category: ExpenseCategory | null,
): asserts category is ExpenseCategory {
	if (!category) {
		throw new Error(EXPENSE_ERRORS.CATEGORY_NOT_FOUND);
	}
}

export function assertExpenseCategoryCanBeSelected(
	category: ExpenseCategory,
	currentCategoryId?: number,
) {
	if (!category.isActive && category.id !== currentCategoryId) {
		throw new Error(EXPENSE_ERRORS.CATEGORY_INACTIVE);
	}
}
