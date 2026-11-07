import type { TitleInput } from "../schemas/form";

export function getAmountCents(amount: number) {
	return BigInt(amount.toFixed(2).replace(".", ""));
}

export function getTitlePlanCents(titles: readonly { amount: number }[]) {
	return titles.reduce(
		(total, title) => total + getAmountCents(title.amount),
		0n,
	);
}

export function buildRevenueTitlePlan(input: {
	negotiatedAmount: number;
	downPaymentAmount: number;
	downPaymentDueDate: string;
	installmentCount: number;
	firstDueDate: string;
	analytic: string;
	expectedPaymentMethod: string;
}): TitleInput[] {
	const total = getAmountCents(input.negotiatedAmount);
	const entry = getAmountCents(input.downPaymentAmount);
	const remaining = total - entry;
	const count = BigInt(input.installmentCount);
	if (entry < 0n || count < 1n || remaining < count) {
		throw new Error(
			"Entrada e quantidade de parcelas devem permitir parcelas de pelo menos R$ 0,01.",
		);
	}
	const base = remaining / count;
	const remainder = remaining % count;
	const common = {
		analytic: input.analytic,
		expectedPaymentMethod: input.expectedPaymentMethod,
		notes: "",
	};
	const titles: TitleInput[] =
		entry > 0n
			? [
					{
						...common,
						kind: "DOWN_PAYMENT",
						amount: Number(entry) / 100,
						dueDate: input.downPaymentDueDate,
					},
				]
			: [];
	const first = new Date(`${input.firstDueDate}T00:00:00Z`);
	for (let index = 0; index < input.installmentCount; index++) {
		const month = first.getUTCMonth() + index;
		const lastDay = new Date(
			Date.UTC(first.getUTCFullYear(), month + 1, 0),
		).getUTCDate();
		const dueDate = new Date(
			Date.UTC(
				first.getUTCFullYear(),
				month,
				Math.min(first.getUTCDate(), lastDay),
			),
		)
			.toISOString()
			.slice(0, 10);
		titles.push({
			...common,
			kind: "INSTALLMENT",
			amount: Number(base + (BigInt(index) < remainder ? 1n : 0n)) / 100,
			dueDate,
		});
	}
	return titles;
}
