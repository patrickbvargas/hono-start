import { prisma } from "@/shared/lib/prisma";
import { optionSchema } from "@/shared/schemas/option";

export async function getTitleGenerationOptions() {
	const [analytics, paymentMethods] = await Promise.all([
		prisma.financialAnalytic.findMany({ orderBy: { label: "asc" } }),
		prisma.paymentMethod.findMany({ orderBy: { label: "asc" } }),
	]);
	return {
		analytics: optionSchema.array().parse(analytics),
		paymentMethods: optionSchema.array().parse(paymentMethods),
	};
}
