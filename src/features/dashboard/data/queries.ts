import { prisma } from "@/shared/lib/prisma";
import type { Option } from "@/shared/schemas/option";
import type { QueryManyReturnType } from "@/shared/types/api";
import type { DashboardSummary } from "../schemas/model";
import { getDashboardRecords } from "./records";
import type { DashboardScope } from "./scope";
import { buildDashboardSummary } from "./summary";

export async function getDashboardSummary(
	scope: DashboardScope,
): Promise<DashboardSummary> {
	return buildDashboardSummary(await getDashboardRecords(scope));
}

export async function getDashboardEmployeeOptions({
	firmId: _firmId,
}: {
	firmId: number;
}): Promise<QueryManyReturnType<Option>> {
	const employees = await prisma.employeeProfile.findMany({
		where: {
			person: { deletedAt: null, isActive: true },
			isActive: true,
		},
		orderBy: [{ person: { fullName: "asc" } }, { id: "asc" }],
		select: {
			id: true,
			person: { select: { fullName: true } },
		},
	});

	return employees.map((employee) => ({
		id: employee.id,
		value: String(employee.id),
		label: employee.person.fullName,
		isDisabled: false,
	}));
}
