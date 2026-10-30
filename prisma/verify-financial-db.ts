import "dotenv/config";
import assert from "node:assert/strict";
import pg from "pg";

const c = new pg.Client({
	connectionString: process.env.DIRECT_URL,
	connectionTimeoutMillis: 15000,
});
await c.connect();
let checked = 0;
async function denied(
	name: string,
	sql: string,
	code: string,
	values: unknown[] = [],
) {
	await c.query("BEGIN");
	try {
		await c.query(sql, values);
		await c.query("SET CONSTRAINTS ALL IMMEDIATE");
		throw new Error(`Expected rejection: ${name}`);
	} catch (error) {
		assert.equal((error as { code?: string }).code, code, name);
		const messages: Record<string, string> = {
			"paid remuneration prevents source reversal":
				"Reverse remuneration payments first",
			overpayment: "Principal exceeds outstanding balance",
			"immutable receipt": "Confirmed financial events are immutable",
			"below abated principal": "Title adjustment conflicts with settlements",
			"cancel settled title": "Title adjustment conflicts with settlements",
			"remuneration beneficiary mismatch": "Remuneration beneficiary mismatch",
		};
		if (messages[name]) {
			assert.ok((error as Error).message.includes(messages[name]), name);
		}
		checked++;
	} finally {
		await c.query("ROLLBACK");
	}
}

try {
	const {
		rows: [fixture],
	} = await c.query(
		`SELECT t.id, crr."revenueId", crr."contractId", t."analyticId", t."expectedPaymentMethodId", t.kind, t."debtorId"
     FROM receivables t
     JOIN contract_revenue_receivables crr ON crr."receivableId" = t.id
     WHERE t."firmId" = 1 AND t.notes = 'Cenário 0'`,
	);
	const {
		rows: [receipt],
	} = await c.query('SELECT id FROM receipts WHERE "receivableId"=$1', [
		fixture.id,
	]);

	// 1. Cross-Firm revenue bridge must fail foreign key
	await denied(
		"cross-Firm bridge",
		`INSERT INTO contract_revenue_receivables ("firmId","contractId","revenueId","receivableId") VALUES(2,$1,$2,$3)`,
		"23503",
		[fixture.contractId, fixture.revenueId, fixture.id],
	);

	// 2. Duplicate receivable bridge must fail unique constraint
	await denied(
		"duplicate receivable bridge",
		`INSERT INTO contract_revenue_receivables ("firmId","contractId","revenueId","receivableId") VALUES(1,$1,$2,$3)`,
		"23505",
		[fixture.contractId, fixture.revenueId, fixture.id],
	);

	// 3. Overpayment on receivable
	await denied(
		"overpayment",
		`INSERT INTO receipts ("firmId","receivableId","actualPaymentMethodId","actorId","effectiveDate","principalAbated","effectiveAmount","requestKey") VALUES(1,$1,$2,1,(CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')::date,1,1,'constraint-test')`,
		"P0001",
		[fixture.id, fixture.expectedPaymentMethodId],
	);

	// 4. Immutable receipt
	await denied(
		"immutable receipt",
		'UPDATE receipts SET "effectiveAmount"="effectiveAmount" WHERE id=$1',
		"P0001",
		[receipt.id],
	);

	// 5. Receivable amount below abated principal
	await denied(
		"below abated principal",
		"UPDATE receivables SET amount=1 WHERE id=$1",
		"P0001",
		[fixture.id],
	);

	// 6. Cancel settled title
	await denied(
		"cancel settled title",
		'UPDATE receivables SET "cancelledAt"=now(),"cancellationReason"=\'test\' WHERE id=$1',
		"P0001",
		[fixture.id],
	);

	// 7. Paid remuneration prevents source reversal
	await denied(
		"paid remuneration prevents source reversal",
		`INSERT INTO receipt_reversals ("firmId","receiptId","actorId","effectiveDate",reason,"requestKey") VALUES(1,$1,1,(CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')::date,'test','constraint-reverse')`,
		"P0001",
		[receipt.id],
	);

	// 8. Remuneration beneficiary mismatch
	const {
		rows: [wrongAssignment],
	} = await c.query(
		`SELECT a.id as "assignmentId", p.id as "payableId"
     FROM payables p
     CROSS JOIN contract_assignments a
     JOIN employee_profiles e ON e.id = a."employeeProfileId"
     JOIN supplier_profiles s ON s.id = p."beneficiaryId"
     WHERE e."personId" <> s."personId"
     LIMIT 1`,
	);
	if (wrongAssignment) {
		await denied(
			"remuneration beneficiary mismatch",
			`INSERT INTO remuneration_payables ("firmId","receiptId","contractAssignmentId","payableId","calculationBase","effectivePercentage","calculatedAmount","computedDueDate","ruleSnapshot")
       VALUES(1,$1,$2,$3,100,0.1,10,CURRENT_DATE,'{}')`,
			"P0001",
			[receipt.id, wrongAssignment.assignmentId, wrongAssignment.payableId],
		);
	}

	// 9. Canonical document check
	await denied(
		"canonical document",
		`INSERT INTO people ("personTypeId","fullName",document,"updatedAt") VALUES(1,'test','bad',now())`,
		"23514",
	);

	// 10. Immutable audit
	await denied(
		"immutable audit",
		`UPDATE audit_logs SET description=description WHERE "entityType"='Seed'`,
		"P0001",
	);

	// 11. Positive reversal test: cancelling receipt cascades cancellation to unpaid remuneration payables
	await c.query("BEGIN");
	try {
		const {
			rows: [source],
		} = await c.query(
			`SELECT rp."receiptId"
       FROM remuneration_payables rp
       JOIN payables p ON p.id = rp."payableId"
       WHERE p.notes = 'Dez advogados: seleção de R$ 5.000'
       LIMIT 1`,
		);
		await c.query(
			`INSERT INTO receipt_reversals ("firmId","receiptId","actorId","effectiveDate",reason,"requestKey")
       VALUES(1,$1,1,(CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')::date,'positive reversal test','positive-reversal')`,
			[source.receiptId],
		);
		const {
			rows: [cancelled],
		} = await c.query(
			`SELECT count(*)::int count
       FROM payables p
       JOIN remuneration_payables rp ON rp."payableId" = p.id
       WHERE rp."receiptId" = $1 AND p."cancelledAt" IS NOT NULL`,
			[source.receiptId],
		);
		assert.equal(cancelled.count, 10);
		checked++;
	} finally {
		await c.query("ROLLBACK");
	}

	// 12. Security RLS check
	const {
		rows: [security],
	} = await c.query(
		`SELECT count(*) FILTER(WHERE NOT c.relrowsecurity)::int AS unprotected, count(*) FILTER(WHERE has_table_privilege('anon',c.oid,'SELECT') OR has_table_privilege('authenticated',c.oid,'SELECT'))::int AS exposed FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r' AND c.relname<>'_prisma_migrations'`,
	);
	assert.equal(security.unprotected, 0);
	assert.equal(security.exposed, 0);

	// 13. Legacy tables check
	const {
		rows: [old],
	} = await c.query(
		`SELECT count(*)::int count FROM information_schema.tables WHERE table_schema='public' AND table_name IN('clients','employees','fees','remunerations','expense_categories','client_types','user_roles','financial_generations','direct_financial_entries','ref_title_kinds','remuneration_calculations')`,
	);
	assert.equal(old.count, 0);

	console.log(
		JSON.stringify({
			databaseConstraintTests: checked,
			rls: security,
			legacyTables: old.count,
		}),
	);
} finally {
	await c.end();
}
