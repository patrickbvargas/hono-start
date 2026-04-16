import { prisma } from "@/shared/lib/prisma";
import { type Option, optionSchema } from "@/shared/schemas/option";
import type { QueryManyReturnType } from "@/shared/types/api";

export async function findClientTypes(): Promise<QueryManyReturnType<Option>> {
	const types = await prisma.clientType.findMany({
		orderBy: { label: "asc" },
	});

	return optionSchema.array().parse(types);
}

export async function findClientTypeByValue(value: string) {
	return prisma.clientType.findUnique({
		where: { value },
	});
}

export async function resolveClientTypeIdsByValues(values: string[]) {
	if (values.length === 0) {
		return [];
	}

	const resolved = await prisma.clientType.findMany({
		where: { value: { in: values } },
		select: { id: true },
	});

	return resolved.map((item) => item.id);
}
