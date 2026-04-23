import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ClientType } from "@/generated/prisma/client";
import { CLIENT_ERRORS } from "../constants/errors";
import type { ClientDetail } from "../schemas/model";

const {
	createAuditLogMock,
	getClientByIdMock,
	getClientTypeByValueMock,
	prismaMock,
} = vi.hoisted(() => ({
	createAuditLogMock: vi.fn(),
	getClientByIdMock: vi.fn(),
	getClientTypeByValueMock: vi.fn(),
	prismaMock: {
		client: {
			create: vi.fn(),
			findFirst: vi.fn(),
			update: vi.fn(),
		},
		$transaction: vi.fn(),
	},
}));

vi.mock("@/shared/lib/prisma", () => ({
	prisma: prismaMock,
}));

vi.mock("@/features/audit-logs/data/mutations", () => ({
	createAuditLog: createAuditLogMock,
}));

vi.mock("../data/queries", () => ({
	getClientById: getClientByIdMock,
	getClientTypeByValue: getClientTypeByValueMock,
}));

import {
	createClient,
	deleteClient,
	restoreClient,
	updateClient,
} from "../data/mutations";

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
		prismaMock.client.create.mockResolvedValue({
			id: 1,
			fullName: "Cliente Teste",
		});
		prismaMock.client.findFirst.mockResolvedValue({
			_count: { contracts: 0 },
		});
		prismaMock.client.update.mockResolvedValue({});
		prismaMock.$transaction.mockImplementation(async (callback) =>
			callback(prismaMock),
		);
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

	it("creates clients inside a transaction and writes an audit log", async () => {
		getClientTypeByValueMock.mockResolvedValue(baseType());

		const input = {
			fullName: "Cliente Teste",
			document: "52998224725",
			email: "cliente@example.com",
			phone: "11999999999",
			type: "INDIVIDUAL",
			isActive: true,
		};

		await expect(
			createClient({
				actor: {
					id: 10,
					name: "Admin",
					email: "admin@example.com",
				},
				firmId: 1,
				input,
			}),
		).resolves.toEqual({ success: true });

		expect(prismaMock.$transaction).toHaveBeenCalledOnce();
		expect(prismaMock.client.create).toHaveBeenCalledWith({
			data: {
				firmId: 1,
				typeId: 30,
				fullName: input.fullName,
				document: input.document,
				email: input.email,
				phone: input.phone,
				isActive: true,
			},
		});
		expect(createAuditLogMock).toHaveBeenCalledWith(
			prismaMock,
			expect.objectContaining({
				firmId: 1,
				action: "CREATE",
				entityType: "Client",
				entityId: 1,
				entityName: input.fullName,
				changeData: input,
			}),
		);
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

	it("updates clients with audit data when actor context is present", async () => {
		const before = baseClient();
		getClientByIdMock.mockResolvedValue(before);
		getClientTypeByValueMock.mockResolvedValue(baseType({ id: 30 }));
		const input = {
			id: 1,
			fullName: "Cliente Atualizado",
			document: "52998224725",
			email: "cliente@example.com",
			phone: "11999999999",
			type: "INDIVIDUAL",
			isActive: true,
		};

		await expect(
			updateClient({
				actor: {
					id: 10,
					name: "Admin",
					email: "admin@example.com",
				},
				firmId: 1,
				input,
			}),
		).resolves.toEqual({ success: true });

		expect(prismaMock.$transaction).toHaveBeenCalledOnce();
		expect(prismaMock.client.update).toHaveBeenCalledWith({
			where: { id: 1 },
			data: {
				fullName: input.fullName,
				document: input.document,
				email: input.email,
				phone: input.phone,
				isActive: true,
			},
		});
		expect(createAuditLogMock).toHaveBeenCalledWith(
			prismaMock,
			expect.objectContaining({
				firmId: 1,
				action: "UPDATE",
				entityType: "Client",
				entityId: 1,
				entityName: input.fullName,
				changeData: { before, after: input },
			}),
		);
	});

	it("soft-deletes clients inside a transaction and writes an audit log", async () => {
		const client = baseClient();
		getClientByIdMock.mockResolvedValue(client);

		await expect(
			deleteClient({
				actor: {
					id: 10,
					name: "Admin",
					email: "admin@example.com",
				},
				firmId: 1,
				id: client.id,
			}),
		).resolves.toEqual({ success: true });

		expect(prismaMock.client.findFirst).toHaveBeenCalledWith({
			where: { id: client.id },
			select: {
				_count: {
					select: {
						contracts: {
							where: {
								AND: [{ deletedAt: null }, { isActive: true }],
							},
						},
					},
				},
			},
		});
		expect(prismaMock.$transaction).toHaveBeenCalledOnce();
		expect(prismaMock.client.update).toHaveBeenCalledWith({
			where: { id: client.id },
			data: { deletedAt: expect.any(Date) },
		});
		expect(createAuditLogMock).toHaveBeenCalledWith(
			prismaMock,
			expect.objectContaining({
				firmId: 1,
				action: "DELETE",
				entityType: "Client",
				entityId: client.id,
				entityName: client.fullName,
				changeData: { before: client },
			}),
		);
	});

	it("blocks soft-delete when active contracts exist before writing", async () => {
		getClientByIdMock.mockResolvedValue(baseClient());
		prismaMock.client.findFirst.mockResolvedValue({
			_count: { contracts: 1 },
		});

		await expect(
			deleteClient({
				firmId: 1,
				id: 1,
			}),
		).rejects.toThrow(CLIENT_ERRORS.ALREADY_HAS_ACTIVE_CONTRACTS);

		expect(prismaMock.$transaction).not.toHaveBeenCalled();
		expect(prismaMock.client.update).not.toHaveBeenCalled();
		expect(createAuditLogMock).not.toHaveBeenCalled();
	});

	it("restores clients by clearing deletedAt and writing an audit log", async () => {
		const client = baseClient({ isSoftDeleted: true });
		getClientByIdMock.mockResolvedValue(client);

		await expect(
			restoreClient({
				actor: {
					id: 10,
					name: "Admin",
					email: "admin@example.com",
				},
				firmId: 1,
				id: client.id,
			}),
		).resolves.toEqual({ success: true });

		expect(prismaMock.$transaction).toHaveBeenCalledOnce();
		expect(prismaMock.client.update).toHaveBeenCalledWith({
			where: { id: client.id },
			data: { deletedAt: null },
		});
		expect(createAuditLogMock).toHaveBeenCalledWith(
			prismaMock,
			expect.objectContaining({
				firmId: 1,
				action: "RESTORE",
				entityType: "Client",
				entityId: client.id,
				entityName: client.fullName,
				changeData: { before: client },
			}),
		);
	});
});
