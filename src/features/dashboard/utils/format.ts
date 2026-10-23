export function formatMonthLabel(value: string) {
	const [year, month] = value.split("-");

	if (!year || !month) {
		return value;
	}

	const date = new Date(Date.UTC(Number(year), Number(month) - 1, 1));

	return new Intl.DateTimeFormat("pt-BR", {
		month: "short",
		year: "2-digit",
		timeZone: "UTC",
	})
		.format(date)
		.replace(".", "")
		.replace(" de ", "/");
}

export function formatCompactCurrency(value: number) {
	const thousands = new Intl.NumberFormat("pt-BR", {
		minimumFractionDigits: 1,
		maximumFractionDigits: 1,
	}).format(value / 1_000);

	return `R$\u00a0${thousands}\u00a0mil`;
}
