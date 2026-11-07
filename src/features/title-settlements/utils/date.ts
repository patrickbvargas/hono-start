export function getSettlementToday(now = new Date()) {
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: "America/Sao_Paulo",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(now);
}

export function getRemunerationDueDate(
	date: string,
	cutoff: number,
	day: number,
) {
	const [year, month, dateDay] = date.split("-").map(Number);
	const first = new Date(
		Date.UTC(year, month - 1 + (dateDay <= cutoff ? 1 : 2), 1),
	);
	const lastDay = new Date(
		Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0),
	).getUTCDate();
	first.setUTCDate(Math.min(day, lastDay));
	return first;
}
