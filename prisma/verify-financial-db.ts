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
			"generation without matching titles":
				"Generation must exactly match agreed amount and origin",
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
		`SELECT t.id, t."revenueId", t."analyticId",t."expectedPaymentMethodId",t."titleKindId",t."debtorId" FROM receivables t WHERE t."firmId"=1 AND t.notes='Cenário 0'`,
	);
	const {
		rows: [receipt],
	} = await c.query('SELECT id FROM receipts WHERE "receivableId"=$1', [
		fixture.id,
	]);
	await denied(
		"cross-Firm revenue",
		`INSERT INTO receivables ("firmId","debtorId","revenueId","analyticId","expectedPaymentMethodId","titleKindId",amount,"dueDate","updatedAt") VALUES(2,$1,$2,$3,$4,$5,100,(CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')::date,now())`,
		"23503",
		[
			fixture.debtorId,
			fixture.revenueId,
			fixture.analyticId,
			fixture.expectedPaymentMethodId,
			fixture.titleKindId,
		],
	);
	await denied(
		"missing title origin",
		`INSERT INTO receivables ("firmId","debtorId","analyticId","expectedPaymentMethodId","titleKindId",amount,"dueDate","updatedAt") VALUES(1,$1,$2,$3,$4,100,(CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')::date,now())`,
		"23514",
		[
			fixture.debtorId,
			fixture.analyticId,
			fixture.expectedPaymentMethodId,
			fixture.titleKindId,
		],
	);
	await denied(
		"overpayment",
		`INSERT INTO receipts ("firmId","receivableId","actualPaymentMethodId","actorId","effectiveDate","principalAbated","effectiveAmount","requestKey") VALUES(1,$1,$2,1,(CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')::date,1,1,'constraint-test')`,
		"P0001",
		[fixture.id, fixture.expectedPaymentMethodId],
	);
	await denied(
		"immutable receipt",
		'UPDATE receipts SET "effectiveAmount"="effectiveAmount" WHERE id=$1',
		"P0001",
		[receipt.id],
	);
	await denied(
		"below abated principal",
		"UPDATE receivables SET amount=1 WHERE id=$1",
		"P0001",
		[fixture.id],
	);
	await denied(
		"cancel settled title",
		'UPDATE receivables SET "cancelledAt"=now(),"cancellationReason"=\'test\' WHERE id=$1',
		"P0001",
		[fixture.id],
	);
	await denied(
		"paid remuneration prevents source reversal",
		`INSERT INTO receipt_reversals ("firmId","receiptId","actorId","effectiveDate",reason,"requestKey") VALUES(1,$1,1,(CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')::date,'test','constraint-reverse')`,
		"P0001",
		[receipt.id],
	);
	await denied(
		"generation without matching titles",
		`INSERT INTO financial_generations ("firmId","revenueId","actorId","requestKey","agreedAmount") SELECT 1,id,1,'constraint-generation',"negotiatedAmount" FROM revenues WHERE "firmId"=1 AND notes LIKE 'Ainda sem%' LIMIT 1`,
		"P0001",
	);
	await denied(
		"canonical document",
		`INSERT INTO people ("personTypeId","fullName",document,"updatedAt") VALUES(1,'test','bad',now())`,
		"23514",
	);
	await denied(
		"immutable audit",
		`UPDATE audit_logs SET description=description WHERE "entityType"='Seed'`,
		"P0001",
	);
	await c.query("BEGIN");
	try {
		const {
			rows: [source],
		} = await c.query(
			`SELECT c."receiptId" FROM remuneration_calculations c JOIN payables p ON p."remunerationCalculationId"=c.id WHERE p.notes='Dez advogados: seleção de R$ 5.000' LIMIT 1`,
		);
		await c.query(
			`INSERT INTO receipt_reversals ("firmId","receiptId","actorId","effectiveDate",reason,"requestKey") VALUES(1,$1,1,(CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')::date,'positive reversal test','positive-reversal')`,
			[source.receiptId],
		);
		const {
			rows: [cancelled],
		} = await c.query(
			`SELECT count(*)::int count FROM payables p JOIN remuneration_calculations c ON c.id=p."remunerationCalculationId" WHERE c."receiptId"=$1 AND p."cancelledAt" IS NOT NULL`,
			[source.receiptId],
		);
		assert.equal(cancelled.count, 10);
		checked++;
	} finally {
		await c.query("ROLLBACK");
	}
	const {
		rows: [security],
	} = await c.query(
		`SELECT count(*) FILTER(WHERE NOT c.relrowsecurity)::int AS unprotected, count(*) FILTER(WHERE has_table_privilege('anon',c.oid,'SELECT') OR has_table_privilege('authenticated',c.oid,'SELECT'))::int AS exposed FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r' AND c.relname<>'_prisma_migrations'`,
	);
	assert.equal(security.unprotected, 0);
	assert.equal(security.exposed, 0);
	const {
		rows: [old],
	} = await c.query(
		`SELECT count(*)::int count FROM information_schema.tables WHERE table_schema='public' AND table_name IN('clients','employees','fees','remunerations','expense_categories','client_types','user_roles')`,
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
