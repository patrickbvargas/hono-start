export function getReceivableToday(now = new Date()) {
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: "America/Sao_Paulo",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(now);
}
export function getReceivableRefreshInterval(now = new Date()) {
	const clock = new Intl.DateTimeFormat("en-GB", {
		timeZone: "America/Sao_Paulo",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hourCycle: "h23",
	}).format(now);
	const [hours, minutes, seconds] = clock.split(":").map(Number);
	return ((24 - hours) * 3600 - minutes * 60 - seconds) * 1000 + 1000;
}
