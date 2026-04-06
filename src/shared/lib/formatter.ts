export const formatter = {
	oab: (oab: string | null) => {
		if (!oab) return "—";
		if (oab.length === 8)
			return `${oab.slice(0, 2)} ${oab.slice(2, 5)}.${oab.slice(5)}`;
		return oab;
	},
	percent: (value: number) => `${(value * 100).toFixed(0)}%`,
	currency: (value: number) =>
		new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
		}).format(value),
	date: (value: string | null) => {
		if (!value) return "—";
		return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
	},
};
