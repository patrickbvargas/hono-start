export const formatter = {
	calendarDate: (value: string | null) => {
		if (!value) {
			return "—";
		}
		const [year, month, day] = value.slice(0, 10).split("-");
		return `${day}/${month}/${year}`;
	},
	phone: (value: string | null) => {
		if (!value) {
			return "—";
		}
		const digits = value.replace(/\D/g, "");
		if (digits.length !== 10 && digits.length !== 11) {
			return value;
		}
		return `(${digits.slice(0, 2)}) ${digits.slice(2, -4)}-${digits.slice(-4)}`;
	},
	document: (doc: string | null) => {
		if (!doc) {
			return "";
		}
		const digits = doc.replace(/\D/g, "");
		if (digits.length === 11) {
			return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
		}
		if (digits.length === 14) {
			return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
		}
		return doc;
	},
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
