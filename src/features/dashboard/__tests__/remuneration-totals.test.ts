import { expect, it } from "vitest";
import { Prisma } from "@/generated/prisma/client";
import { buildMonthlyRemunerationTable } from "../data/remuneration";

it("keeps remuneration month, collaborator and subtotal amounts precise", () => {
	const result = buildMonthlyRemunerationTable({
		range: {
			startMonth: new Date("2026-01-01Z"),
			endMonth: new Date("2026-02-01Z"),
			label: "2026",
		},
		rows: [
			{
				amount: new Prisma.Decimal("0.1"),
				paymentDate: new Date("2026-01-05Z"),
				contractEmployee: { employee: { id: 1, fullName: "Ana" } },
			},
			{
				amount: new Prisma.Decimal("0.2"),
				paymentDate: new Date("2026-02-05Z"),
				contractEmployee: { employee: { id: 1, fullName: "Ana" } },
			},
			{
				amount: new Prisma.Decimal("0.2"),
				paymentDate: new Date("2026-01-05Z"),
				contractEmployee: { employee: { id: 2, fullName: "Bia" } },
			},
		],
	});
	expect(result.table[0].total).toBe(0.3);
	expect(result.subtotal?.months["2026-01"]).toBe(0.3);
	expect(result.subtotal?.total).toBe(0.5);
});
