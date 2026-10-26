import type { Prisma } from "@/generated/prisma/client";

export const dashboardRevenueSelect = {
	id: true,
	totalValue: true,
	downPaymentValue: true,
	paymentStartDate: true,
	totalInstallments: true,
	type: { select: { label: true, value: true } },
	contract: {
		select: {
			id: true,
			processNumber: true,
			client: { select: { id: true, fullName: true } },
			legalArea: { select: { label: true, value: true } },
			assignments: {
				where: { deletedAt: null, isActive: true },
				select: {
					employee: { select: { fullName: true } },
					assignmentType: { select: { value: true } },
				},
			},
		},
	},
	fees: {
		where: { deletedAt: null, isActive: true },
		select: {
			id: true,
			amount: true,
			paymentDate: true,
			installmentNumber: true,
		},
	},
} satisfies Prisma.RevenueSelect;
