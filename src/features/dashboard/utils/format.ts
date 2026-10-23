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
	if (value === 0) {
		return "R$ 0";
	}

	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
		notation: "compact",
		maximumFractionDigits: 1,
	}).format(value);
}
