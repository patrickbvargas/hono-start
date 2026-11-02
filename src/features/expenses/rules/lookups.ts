import type { SupplierProfile } from "@/generated/prisma/client";
import { EXPENSE_ERRORS } from "../constants/errors";

export function assertSupplierExists(
	supplier: SupplierProfile | null,
): asserts supplier is SupplierProfile {
	if (!supplier) {
		throw new Error(EXPENSE_ERRORS.SUPPLIER_NOT_FOUND);
	}
}

export function assertSupplierCanBeSelected(
	supplier: SupplierProfile,
	currentSupplierId?: number,
) {
	if (!supplier.isActive && supplier.id !== currentSupplierId) {
		throw new Error(EXPENSE_ERRORS.SUPPLIER_INACTIVE);
	}
}
