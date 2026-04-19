import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ClientType } from "@/generated/prisma/client";
import { CLIENT_ERRORS } from "../constants/errors";
import type { ClientDetail } from "../schemas/model";

const { getClientByIdMock, getClientTypeByValueMock, prismaMock } = vi.hoisted(
	() => ({
		getClientByIdMock: vi.fn(),
		getClientTypeByValueMock: vi.fn(),
		prismaMock: {
			client: {
				create: vi.fn(),
				update: vi.fn(),
			},
		},
	}),
);

vi.mock("@/shared/lib/prisma", () => ({
	prisma: prismaMock,
}));

vi.mock("../data/queries", () => ({
	getClientById: getClientByIdMock,
	getClientTypeByValue: getClientTypeByValueMock,
}));

import { createClient, updateClient } from "../data/mutations";

const baseType = (overrides: Partial<ClientType> = {}): ClientType => ({
	id: 30,
	value: "INDIVIDUAL",
	label: "Pessoa Física",
	isActive: true,
	...overrides,
});

const baseClient = (overrides: Partial<ClientDetail> = {}): ClientDetail => ({
	id: 1,
	fullName: "Cliente Teste",
	document: "52998224725",
	email: "cliente@example.com",
	phone: "11999999999",
	typeId: 30,
	typeValue: "INDIVIDUAL",
	type: "Pessoa Física",
	contractCount: 0,
	isActive: true,
	isSoftDeleted: false,
	createdAt: "2026-01-01T00:00:00.000Z",
	updatedAt: "2026-01-01T00:00:00.000Z",
	...overrides,
});

describe("client lookup-backed writes", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		prismaMock.client.create.mockResolvedValue({});
		prismaMock.client.update.mockResolvedValue({});
	});

	it("rejects unknown types on create", async () => {
		getClientTypeByValueMock.mockResolvedValue(null);

		await expect(
			createClient({
				firmId: 1,
				input: {
					fullName: "Cliente Teste",
					document: "52998224725",
					email: "cliente@example.com",
					phone: "11999999999",
					type: "UNKNOWN",
					isActive: true,
				},
			}),
		).rejects.toThrow(CLIENT_ERRORS.TYPE_NOT_FOUND);

		expect(prismaMock.client.create).not.toHaveBeenCalled();
	});

	it("allows unchanged inactive persisted types on update", async () => {
		getClientByIdMock.mockResolvedValue(baseClient());
		getClientTypeByValueMock.mockResolvedValue(
			baseType({ id: 30, isActive: false }),
		);

		await expect(
			updateClient({
				firmId: 1,
				input: {
					id: 1,
					fullName: "Cliente Teste",
					document: "52998224725",
					email: "cliente@example.com",
					phone: "11999999999",
					type: "INDIVIDUAL",
					isActive: true,
				},
			}),
		).resolves.toEqual({ success: true });

		expect(prismaMock.client.update).toHaveBeenCalledOnce();
	});
});
