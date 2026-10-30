import type { SeedTransaction } from "./seed-financial-fixtures.js";
import {
	businessDate,
	remunerationDueDate,
	SEED_MARKER,
	seedCpf,
	shiftedDate,
} from "./seed-financial-fixtures.js";

export async function seedFinancialScenarios(
	tx: SeedTransaction,
	lookups: Record<string, Record<string, number>>,
) {
	const today = businessDate();
	const past = shiftedDate(today, -20);
	const future = shiftedDate(today, 20);
	const id = (catalog: string, value: string) => {
		const result = lookups[catalog]?.[value];
		if (!result) {
			throw new Error(`Missing ${catalog}/${value}`);
		}
		return result;
	};
	for (const [key, name] of [
		[1, "Matriz"],
		[2, "POA"],
	] as const) {
		await tx.firm.upsert({
			where: { id: key },
			update: {},
			create: { id: key, name },
		});
	}
	for (let i = 1; i <= 14; i++) {
		await tx.person.create({
			data: {
				id: i,
				fullName:
					i === 1
						? "Administrador demonstrativo"
						: i === 2
							? "Colaborador demonstrativo"
							: `Pessoa demonstrativa ${i}`,
				document: seedCpf(i),
				personTypeId: id("personType", "INDIVIDUAL"),
				clientProfile: { create: { id: i } },
				supplierProfile: { create: { id: i } },
				isActive: i !== 14,
			},
		});
		if (i <= 11) {
			await tx.employeeProfile.create({
				data: {
					id: i,
					personId: i,
					employeeTypeId: id(
						"employeeType",
						i === 11 ? "ADMIN_ASSISTANT" : "LAWYER",
					),
					oabNumber: i === 11 ? null : `RS${String(i).padStart(6, "0")}`,
					remunerationPercentage: "0.1000",
					referralPercentage: "0.0200",
				},
			});
		}
	}
	await tx.person.create({
		data: {
			id: 15,
			fullName: "Empresa demonstrativa",
			document: "11222333000181",
			personTypeId: id("personType", "COMPANY"),
			clientProfile: { create: { id: 15 } },
			supplierProfile: { create: { id: 15 } },
		},
	});
	let serial = 0;
	const key = (label: string) => `${SEED_MARKER}:${label}:${++serial}`;
	const analytic = id("financialAnalytic", "OTHER"),
		method = id("paymentMethod", "PIX");
	const titleBase = {
		analyticId: analytic,
		expectedPaymentMethodId: method,
		kind: "INSTALLMENT" as const,
	};
	const receipt = async (
		receivableId: number,
		principal: string,
		discount = "0.00",
		interest = "0.00",
		effective = principal,
		generate = false,
		date = past,
	) =>
		tx.receipt.create({
			data: {
				firmId: 1,
				receivableId,
				principalAbated: principal,
				discount,
				interest,
				penalty: "0.00",
				effectiveAmount: effective,
				generatesRemuneration: generate,
				effectiveDate: date,
				actualPaymentMethodId: method,
				actorId: 1,
				reason:
					discount !== "0.00" || interest !== "0.00"
						? "Ajuste demonstrativo autorizado"
						: null,
				requestKey: key("receipt"),
			},
		});

	for (const firmId of [1, 2]) {
		const contract = await tx.contract.create({
			data: {
				firmId,
				customerId: 12,
				legalAreaId: id("legalArea", firmId === 1 ? "LABOR" : "CIVIL"),
				statusId: id("contractStatus", "ACTIVE"),
				processNumber: `DEMO-${firmId}-001`,
				feePercentage: "0.3000",
				notes:
					"Contrato demonstrativo com receitas geradas e receita sem acerto",
			},
		});
		const assignments = [];
		for (let i = 1; i <= (firmId === 1 ? 11 : 2); i++) {
			assignments.push(
				await tx.contractAssignment.create({
					data: {
						firmId,
						contractId: contract.id,
						employeeProfileId: i,
						assignmentTypeId: id(
							"assignmentType",
							i === 11
								? "ADMIN_ASSISTANT"
								: i === 9
									? "RECOMMENDING"
									: i === 10
										? "RECOMMENDED"
										: "RESPONSIBLE",
						),
					},
				}),
			);
		}
		await tx.revenue.create({
			data: {
				firmId,
				contractId: contract.id,
				revenueTypeId: id("revenueType", "SUCCUMBENCY"),
				negotiatedAmount: "750.00",
				notes: "Ainda sem acerto: impede contrato financeiramente quitado",
			},
		});
		const revenue = await tx.revenue.create({
			data: {
				firmId,
				contractId: contract.id,
				revenueTypeId: id("revenueType", "JUDICIAL"),
				negotiatedAmount: "10000.00",
				notes: "Entrada e parcelas com datas explícitas",
			},
		});

		const amounts = [
			"5000.00",
			"1000.00",
			"1000.00",
			"1000.00",
			"1000.00",
			"1000.00",
		];
		const titles = [];
		for (let i = 0; i < amounts.length; i++) {
			const rec = await tx.receivable.create({
				data: {
					...titleBase,
					firmId,
					debtorId: 12,
					amount: amounts[i],
					dueDate: i < 4 ? past : future,
					kind: i === 0 ? "DOWN_PAYMENT" : "INSTALLMENT",
					notes: `Cenário ${i}`,
				},
			});
			await tx.contractRevenueReceivable.create({
				data: {
					firmId,
					contractId: contract.id,
					revenueId: revenue.id,
					receivableId: rec.id,
				},
			});
			titles.push(rec);
		}

		if (firmId === 1) {
			const source = await receipt(
				titles[0].id,
				"5000.00",
				"0.00",
				"0.00",
				"5000.00",
				true,
			);
			// Ten distinct lawyers with formula snapshots; total face value exactly 5000.
			const bonusContract = await tx.contract.create({
				data: {
					firmId,
					customerId: 13,
					legalAreaId: id("legalArea", "FAMILY"),
					statusId: id("contractStatus", "ACTIVE"),
					processNumber: "DEMO-1-TEN-LAWYERS",
					feePercentage: "0.3000",
					notes: "Dez advogados: pagamento múltiplo de 5000",
				},
			});
			const bonusRevenue = await tx.revenue.create({
				data: {
					firmId,
					contractId: bonusContract.id,
					revenueTypeId: id("revenueType", "ADMINISTRATIVE"),
					negotiatedAmount: "5000.00",
				},
			});
			const bonusTitle = await tx.receivable.create({
				data: {
					...titleBase,
					firmId,
					debtorId: 13,
					amount: "5000.00",
					dueDate: past,
					kind: "INSTALLMENT",
				},
			});
			await tx.contractRevenueReceivable.create({
				data: {
					firmId,
					contractId: bonusContract.id,
					revenueId: bonusRevenue.id,
					receivableId: bonusTitle.id,
				},
			});
			const bonusReceipt = await receipt(
				bonusTitle.id,
				"5000.00",
				"0.00",
				"0.00",
				"5000.00",
				true,
			);

			for (let i = 1; i <= 10; i++) {
				const assignment = await tx.contractAssignment.create({
					data: {
						firmId,
						contractId: bonusContract.id,
						employeeProfileId: i,
						assignmentTypeId: id("assignmentType", "RESPONSIBLE"),
					},
				});
				const payable = await tx.payable.create({
					data: {
						...titleBase,
						firmId,
						beneficiaryId: i,
						amount: "500.00",
						dueDate: remunerationDueDate(past),
						analyticId: id("financialAnalytic", "PAYROLL_LAWYERS"),
						notes: "Dez advogados: seleção de R$ 5.000",
					},
				});
				await tx.remunerationPayable.create({
					data: {
						firmId,
						receiptId: bonusReceipt.id,
						contractAssignmentId: assignment.id,
						payableId: payable.id,
						calculationBase: "5000.00",
						effectivePercentage: "0.1000",
						calculatedAmount: "500.00",
						computedDueDate: remunerationDueDate(past),
						ruleSnapshot: {
							employeePercentage: "0.1000",
							assignmentType: "RESPONSIBLE",
							cutoffDay: 25,
							dueDay: 5,
						},
					},
				});
			}

			for (const assignment of assignments) {
				const isReferral =
						assignment.assignmentTypeId ===
						id("assignmentType", "RECOMMENDING"),
					isRecommended =
						assignment.assignmentTypeId === id("assignmentType", "RECOMMENDED");
				const pct = isReferral ? "0.0200" : isRecommended ? "0.0800" : "0.1000";
				const amount = isReferral
					? "100.00"
					: isRecommended
						? "400.00"
						: "500.00";
				const employee = await tx.employeeProfile.findUniqueOrThrow({
					where: { id: assignment.employeeProfileId },
				});
				const supplier = await tx.supplierProfile.findUniqueOrThrow({
					where: { personId: employee.personId },
				});
				const computedDueDate = remunerationDueDate(past);
				const payable = await tx.payable.create({
					data: {
						...titleBase,
						firmId,
						beneficiaryId: supplier.id,
						amount,
						dueDate: computedDueDate,
						analyticId: id(
							"financialAnalytic",
							assignment.employeeProfileId === 11
								? "PAYROLL_STAFF"
								: "PAYROLL_LAWYERS",
						),
					},
				});
				await tx.remunerationPayable.create({
					data: {
						firmId,
						receiptId: source.id,
						contractAssignmentId: assignment.id,
						payableId: payable.id,
						calculationBase: "5000.00",
						effectivePercentage: pct,
						calculatedAmount: amount,
						computedDueDate,
						ruleSnapshot: {
							employeePercentage: "0.1000",
							referralPercentage: "0.0200",
							assignmentTypeId: assignment.assignmentTypeId,
							cutoffDay: 25,
							dueDay: 5,
						},
					},
				});
				if (assignment.employeeProfileId === 1) {
					await tx.payment.create({
						data: {
							firmId,
							payableId: payable.id,
							effectiveDate: past,
							principalAbated: "200.00",
							effectiveAmount: "200.00",
							actualPaymentMethodId: method,
							actorId: 1,
							requestKey: key("payment"),
						},
					});
				}
			}

			await receipt(titles[1].id, "400.00", "20.00", "10.00", "390.00");
			await receipt(titles[1].id, "100.00");
			await receipt(titles[2].id, "1000.00", "1000.00", "0.00", "0.00");
			const reversed = await receipt(
				titles[3].id,
				"1000.00",
				"0.00",
				"0.00",
				"1000.00",
				false,
				shiftedDate(today, -40),
			);
			await tx.receiptReversal.create({
				data: {
					firmId,
					receiptId: reversed.id,
					effectiveDate: today,
					reason: "Estorno demonstrativo",
					actorId: 1,
					requestKey: key("reversal"),
				},
			});

			const extra = await tx.receivable.create({
				data: {
					...titleBase,
					firmId,
					debtorId: 12,
					amount: "200.00",
					dueDate: future,
					notes: "Extra autorizado após geração",
					kind: "EXTRA",
					cancelledAt: today,
					cancellationReason: "Cancelamento demonstrativo sem liquidação",
				},
			});
			await tx.contractRevenueReceivable.create({
				data: {
					firmId,
					contractId: contract.id,
					revenueId: revenue.id,
					receivableId: extra.id,
				},
			});
			await tx.auditLog.create({
				data: {
					firmId,
					actorId: 1,
					actorName: "Seed demonstrativo",
					action: "CANCEL",
					entityType: "Receivable",
					entityId: String(extra.id),
					entityName: "Extra cancelado",
					description: "Cancelamento demonstrativo",
					receivableId: extra.id,
					changeData: { reason: "Cancelamento demonstrativo sem liquidação" },
				},
			});
		}

		const expense = await tx.expense.create({
			data: {
				firmId,
				supplierId: 13,
				negotiatedAmount: "1000.00",
				notes: "Despesa operacional: dinheiro sai somente pelo pagamento",
			},
		});
		const payable = await tx.payable.create({
			data: {
				...titleBase,
				firmId,
				beneficiaryId: 13,
				amount: "1000.00",
				dueDate: past,
			},
		});
		await tx.expensePayable.create({
			data: {
				firmId,
				expenseId: expense.id,
				payableId: payable.id,
			},
		});

		if (firmId === 1) {
			const payment = await tx.payment.create({
				data: {
					firmId,
					payableId: payable.id,
					principalAbated: "500.00",
					discount: "25.00",
					interest: "10.00",
					effectiveAmount: "485.00",
					reason: "Desconto e juros demonstrativos",
					effectiveDate: past,
					actualPaymentMethodId: method,
					actorId: 1,
					requestKey: key("payment"),
				},
			});
			await tx.paymentReversal.create({
				data: {
					firmId,
					paymentId: payment.id,
					actorId: 1,
					effectiveDate: today,
					reason: "Correção demonstrativa",
					requestKey: key("payment-reversal"),
				},
			});
		}

		for (const direction of ["in", "out"]) {
			if (direction === "in") {
				await tx.receivable.create({
					data: {
						...titleBase,
						firmId,
						debtorId: 12,
						amount: "300.00",
						dueDate: future,
						notes: "Lançamento avulso a receber",
					},
				});
			} else {
				await tx.payable.create({
					data: {
						...titleBase,
						firmId,
						beneficiaryId: 13,
						amount: "250.00",
						dueDate: past,
						notes: "Lançamento avulso a pagar",
					},
				});
			}
		}
	}

	const roundingContract = await tx.contract.create({
		data: {
			firmId: 1,
			customerId: 12,
			legalAreaId: id("legalArea", "SOCIAL_SECURITY"),
			statusId: id("contractStatus", "COMPLETED"),
			processNumber: "DEMO-ROUNDING",
			feePercentage: "0.3000",
			notes: "Contrato concluído mantém dívida pendente",
		},
	});
	const roundingRevenue = await tx.revenue.create({
		data: {
			firmId: 1,
			contractId: roundingContract.id,
			revenueTypeId: id("revenueType", "ADMINISTRATIVE"),
			negotiatedAmount: "100.00",
		},
	});
	for (const [i, amount] of ["33.33", "33.33", "33.34"].entries()) {
		const rec = await tx.receivable.create({
			data: {
				...titleBase,
				firmId: 1,
				debtorId: 12,
				amount,
				dueDate: shiftedDate(future, 30 * i),
				notes: "Arredondamento: resto na última parcela",
			},
		});
		await tx.contractRevenueReceivable.create({
			data: {
				firmId: 1,
				contractId: roundingContract.id,
				revenueId: roundingRevenue.id,
				receivableId: rec.id,
			},
		});
	}

	await tx.contract.create({
		data: {
			firmId: 1,
			customerId: 13,
			legalAreaId: id("legalArea", "OTHER"),
			statusId: id("contractStatus", "CANCELLED"),
			processNumber: "DEMO-CANCELLED",
			feePercentage: "0.3000",
			notes: "Origem cancelada não cancela títulos automaticamente",
		},
	});

	await tx.auditLog.create({
		data: {
			firmId: 1,
			actorId: 1,
			actorName: "Seed demonstrativo",
			action: "SEED",
			entityType: "Seed",
			entityId: SEED_MARKER,
			entityName: SEED_MARKER,
			description: "Seed financeiro completo",
			changeData: { referenceDate: today.toISOString(), version: 1 },
		},
	});

	// Explicit fixture IDs must not collide with the next application insert.
	await tx.$executeRawUnsafe(
		`SELECT setval(pg_get_serial_sequence('people','id'),(SELECT max(id) FROM people))`,
	);
	await tx.$executeRawUnsafe(
		`SELECT setval(pg_get_serial_sequence('employee_profiles','id'),(SELECT max(id) FROM employee_profiles))`,
	);
	await tx.$executeRawUnsafe(
		`SELECT setval(pg_get_serial_sequence('firms','id'),(SELECT max(id) FROM firms))`,
	);
}

// Idempotent additive scenarios for an already seeded development database.
export async function completeFinancialFixtures(tx: SeedTransaction) {
	const personType = await tx.personType.findUniqueOrThrow({
		where: { value: "INDIVIDUAL" },
	});
	const employeeType = await tx.employeeType.findUniqueOrThrow({
		where: { value: "LAWYER" },
	});
	const patrick = await tx.person.upsert({
		where: { document: seedCpf(1000) },
		update: {},
		create: {
			id: 1000,
			fullName: "Patrick Vargas",
			document: seedCpf(1000),
			personTypeId: personType.id,
			supplierProfile: { create: { id: 1000 } },
		},
	});
	await tx.employeeProfile.upsert({
		where: { personId: patrick.id },
		update: {},
		create: {
			id: 1000,
			personId: patrick.id,
			employeeTypeId: employeeType.id,
			oabNumber: "RS900001",
			remunerationPercentage: "0.1000",
			referralPercentage: "0.0200",
		},
	});
	await tx.$executeRawUnsafe(
		`SELECT setval(pg_get_serial_sequence('people','id'),(SELECT max(id) FROM people))`,
	);
	await tx.$executeRawUnsafe(
		`SELECT setval(pg_get_serial_sequence('employee_profiles','id'),(SELECT max(id) FROM employee_profiles))`,
	);

	const today = businessDate();
	const contract = await tx.contract.findUniqueOrThrow({
		where: {
			firmId_processNumber: { firmId: 1, processNumber: "DEMO-CANCELLED" },
		},
	});
	const analytic = await tx.financialAnalytic.findUniqueOrThrow({
		where: { value: "OTHER" },
	});
	const method = await tx.paymentMethod.findUniqueOrThrow({
		where: { value: "PIX" },
	});
	const base = {
		firmId: 1,
		analyticId: analytic.id,
		expectedPaymentMethodId: method.id,
		kind: "INSTALLMENT" as const,
	};
	const existingReceivable = await tx.contractRevenueReceivable.findFirst({
		where: {
			firmId: 1,
			contractId: contract.id,
			revenue: { notes: "Cancelamento operacional preserva dívida" },
		},
	});
	if (!existingReceivable) {
		const type = await tx.revenueType.findUniqueOrThrow({
			where: { value: "JUDICIAL" },
		});
		const revenue = await tx.revenue.create({
			data: {
				firmId: 1,
				contractId: contract.id,
				revenueTypeId: type.id,
				negotiatedAmount: "100.00",
				notes: "Cancelamento operacional preserva dívida",
			},
		});
		const receivable = await tx.receivable.create({
			data: {
				...base,
				debtorId: 13,
				amount: "100.00",
				dueDate: shiftedDate(today, -10),
			},
		});
		await tx.contractRevenueReceivable.create({
			data: {
				firmId: 1,
				contractId: contract.id,
				revenueId: revenue.id,
				receivableId: receivable.id,
			},
		});
	}
	const paymentKey = `${SEED_MARKER}:full-discount-payment`;
	if (
		!(await tx.payment.findFirst({
			where: { firmId: 1, requestKey: paymentKey },
		}))
	) {
		const payable = await tx.payable.create({
			data: {
				...base,
				beneficiaryId: 13,
				amount: "100.00",
				dueDate: shiftedDate(today, 10),
				notes: "Pagamento antecipado com desconto integral demonstrativo",
			},
		});
		await tx.payment.create({
			data: {
				firmId: 1,
				payableId: payable.id,
				actorId: 1,
				actualPaymentMethodId: method.id,
				effectiveDate: today,
				principalAbated: "100.00",
				discount: "100.00",
				effectiveAmount: "0.00",
				reason: "Desconto integral autorizado demonstrativo",
				requestKey: paymentKey,
			},
		});
	}
}

export async function seedGenericPeople(tx: SeedTransaction) {
	for (const table of ["client_profiles", "supplier_profiles"] as const) {
		await tx.$executeRawUnsafe(
			`SELECT setval(pg_get_serial_sequence('${table}','id'),COALESCE((SELECT max(id) FROM ${table}),1),EXISTS(SELECT 1 FROM ${table}))`,
		);
	}

	for (const [seedKey, fullName, role] of [
		["generic-payments", "Pagamentos diversos", "supplier"],
		["generic-receipts", "Recebimentos diversos", "client"],
	] as const) {
		const person = await tx.person.upsert({
			where: { seedKey },
			update: {},
			create: { seedKey, fullName, isGeneric: true },
		});
		if (role === "supplier") {
			await tx.supplierProfile.upsert({
				where: { personId: person.id },
				update: {},
				create: { personId: person.id },
			});
		} else {
			await tx.clientProfile.upsert({
				where: { personId: person.id },
				update: {},
				create: { personId: person.id },
			});
		}
	}
}
