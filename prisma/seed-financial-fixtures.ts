import type { Prisma } from "../src/generated/prisma/client.js";

export function businessDate(value = new Date()) {
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone: "America/Sao_Paulo",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).formatToParts(value);
	const part = (key: string) => parts.find((p) => p.type === key)?.value;
	return new Date(`${part("year")}-${part("month")}-${part("day")}T00:00:00Z`);
}
export function shiftedDate(date: Date, days: number) {
	const result = new Date(date);
	result.setUTCDate(result.getUTCDate() + days);
	return result;
}
export function remunerationDueDate(date: Date, cutoff = 25, due = 5) {
	const month = date.getUTCMonth() + (date.getUTCDate() <= cutoff ? 1 : 2);
	const last = new Date(
		Date.UTC(date.getUTCFullYear(), month + 1, 0),
	).getUTCDate();
	return new Date(Date.UTC(date.getUTCFullYear(), month, Math.min(due, last)));
}
export function seedCpf(index: number) {
	let base = String(800000000 + index).padStart(9, "0");
	for (let round = 0; round < 2; round++) {
		let sum = 0;
		for (let i = 0; i < base.length; i++) {
			sum += Number(base[i]) * (base.length + 1 - i);
		}
		const digit = (sum * 10) % 11;
		base += String(digit === 10 ? 0 : digit);
	}
	return base;
}
export const SEED_MARKER = "financial-bridge-seed-v1";
export type SeedTransaction = Prisma.TransactionClient;
