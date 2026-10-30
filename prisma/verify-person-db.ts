import "dotenv/config";
import assert from "node:assert/strict";
import pg from "pg";
const client=new pg.Client({connectionString:process.env.DIRECT_URL,connectionTimeoutMillis:15000});
await client.connect();
let checks=0;
async function rejected(name:string,sql:string,code:string,values:unknown[]=[]) {
 await client.query("BEGIN");
 try {await client.query(sql,values);await client.query("SET CONSTRAINTS ALL IMMEDIATE");assert.fail(name);} catch(error){assert.equal((error as {code?:string}).code,code,name);checks++;} finally{await client.query("ROLLBACK");}
}
try {
 const generic=await client.query(`SELECT p.id,p.document,p."personTypeId",p."isGeneric",p."seedKey",c.id AS client,s.id AS supplier,e.id AS employee FROM people p LEFT JOIN client_profiles c ON c."personId"=p.id LEFT JOIN supplier_profiles s ON s."personId"=p.id LEFT JOIN employee_profiles e ON e."personId"=p.id WHERE p."seedKey" IN ('generic-payments','generic-receipts')`);
 assert.equal(generic.rowCount,2);
 for(const row of generic.rows){assert.equal(row.document,null);assert.equal(row.personTypeId,null);assert.equal(row.isGeneric,true);assert.equal(row.employee,null);assert.ok(row.seedKey==='generic-payments' ? row.supplier : row.client);}checks++;
 const missing=await client.query(`SELECT count(*)::int AS n FROM employee_profiles e WHERE e."isActive" AND e."deletedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM supplier_profiles s WHERE s."personId"=e."personId" AND s."isActive")`);assert.equal(missing.rows[0].n,0);checks++;
 const types=await client.query(`SELECT id FROM ref_person_types WHERE value='INDIVIDUAL'`);const type=types.rows[0].id;
 await rejected('ordinary document required',`INSERT INTO people("fullName","personTypeId","updatedAt") VALUES('Invalid ordinary',$1,now())`,'23514',[type]);
 await rejected('generic employee forbidden',`INSERT INTO employee_profiles("personId","employeeTypeId","remunerationPercentage","referralPercentage","updatedAt") SELECT p.id,t.id,0,0,now() FROM people p CROSS JOIN ref_employee_types t WHERE p."seedKey"='generic-payments' AND t.value='ADMIN_ASSISTANT'`,'P0001');
 await rejected('employee supplier dependency',`UPDATE supplier_profiles SET "isActive"=false WHERE "personId"=1000`,'P0001');
 const scope=await client.query(`SELECT id FROM supplier_profiles WHERE "personId"=13`);
 await rejected('outstanding supplier cannot deactivate',`UPDATE supplier_profiles SET "isActive"=false WHERE id=$1`,'P0001',[scope.rows[0].id]);
 await client.query('BEGIN');
 try {
 const person=await client.query(`INSERT INTO people("fullName",document,"personTypeId","updatedAt") VALUES('Rollback profile identity','52998224725',$1,now()) RETURNING id`,[type]);
 const pid=person.rows[0].id;
 await client.query(`INSERT INTO client_profiles(id,"personId","updatedAt") VALUES(810000,$1,now())`,[pid]);
 await client.query(`INSERT INTO supplier_profiles(id,"personId","updatedAt") VALUES(820000,$1,now())`,[pid]);
 const direct=await client.query(`INSERT INTO direct_financial_entries("firmId","actorId",reason) VALUES(1,1,'Rolled-back profile verification') RETURNING id`);
 const ref=await client.query(`SELECT "analyticId","expectedPaymentMethodId","titleKindId" FROM receivables LIMIT 1`);const x=ref.rows[0];
 await client.query(`INSERT INTO receivables("firmId","debtorId","directEntryId","analyticId","expectedPaymentMethodId","titleKindId",amount,"dueDate","updatedAt") VALUES(1,810000,$1,$2,$3,$4,100,CURRENT_DATE,now())`,[direct.rows[0].id,x.analyticId,x.expectedPaymentMethodId,x.titleKindId]);
 await client.query(`INSERT INTO payables("firmId","beneficiaryId","directEntryId","analyticId","expectedPaymentMethodId","titleKindId",amount,"dueDate","updatedAt") VALUES(1,820000,$1,$2,$3,$4,100,CURRENT_DATE,now())`,[direct.rows[0].id,x.analyticId,x.expectedPaymentMethodId,x.titleKindId]);
 await client.query('SET CONSTRAINTS ALL IMMEDIATE');checks++;
 } finally {await client.query('ROLLBACK');}
 console.log(JSON.stringify({checks,allPassed:true,writeTests:'rolled back'}));
} finally {await client.end();}
