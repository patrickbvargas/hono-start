import "dotenv/config";
import { readFile, writeFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { createHash } from "node:crypto";
import { prisma } from "../src/shared/lib/prisma";
import { uploadAttachmentFile, readAttachmentFile } from "../src/shared/lib/attachment-storage";

const root = resolve("storage/attachments");
const report: Array<{ id: number; key: string; size: number; sha256: string; status: string }> = [];
try {
 const rows = await prisma.attachment.findMany({ select: { id: true, storagePath: true, mimeType: true } });
 for (const row of rows) {
  console.log("Fixture key:", row.storagePath);
  const source = resolve(root, row.storagePath);
  if (!source.startsWith(root + sep)) { throw new Error("Unsafe source"); }
  let bytes: Buffer;
  try { bytes = await readFile(source); }
  catch (error) {
   if ((error as { code?: string }).code !== "ENOENT") { throw error; }
   report.push({ id: row.id, key: row.storagePath, size: 0, sha256: "", status: "missing-local-source" });
   continue;
  }
  let existing: Buffer | undefined;
  try { existing = await readAttachmentFile({ path: row.storagePath }); }
  catch (error) { if ((error as { code?: string }).code !== "ENOENT") { throw error; } }
  if (existing && !existing.equals(bytes)) { throw new Error("Existing object differs; refusing overwrite"); }
  if (!existing) { await uploadAttachmentFile({ path: row.storagePath, data: bytes, contentType: row.mimeType }); }
  const verified = await readAttachmentFile({ path: row.storagePath });
  if (!verified.equals(bytes)) { throw new Error("Verification failed"); }
  report.push({ id: row.id, key: row.storagePath, size: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex"), status: existing ? "verified-existing" : "copied-verified" });
 }
 console.log("Verified fixtures:", report.length);
} finally {
 await writeFile("storage/r2-fixture-migration.json", JSON.stringify(report, null, 2));
 await prisma.$disconnect();
}


