import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const routeCases = [
	{
		file: resolve(import.meta.dirname, "../routes/_app/clientes.tsx"),
		middleware: "stripSearchParams(clientSearchDefaults)",
	},
	{
		file: resolve(import.meta.dirname, "../routes/_app/colaboradores.tsx"),
		middleware: "stripSearchParams(employeeSearchDefaults)",
	},
	{
		file: resolve(import.meta.dirname, "../routes/_app/contratos.tsx"),
		middleware: "stripSearchParams(contractSearchDefaults)",
	},
	{
		file: resolve(import.meta.dirname, "../routes/_app/honorarios.tsx"),
		middleware: "stripSearchParams(feeSearchDefaults)",
	},
	{
		file: resolve(import.meta.dirname, "../routes/_app/remuneracoes.tsx"),
		middleware: "stripSearchParams(remunerationSearchDefaults)",
	},
	{
		file: resolve(import.meta.dirname, "../routes/_app/audit-log.tsx"),
		middleware: "stripSearchParams(auditLogSearchDefaults)",
	},
	{
		file: resolve(import.meta.dirname, "../routes/_app/index.tsx"),
		middleware: "stripSearchParams(dashboardSearchDefaults)",
	},
];

describe("route search canonicalization", () => {
	it.each(routeCases)(
		"wires %s middleware at route level",
		({ file, middleware }) => {
			const content = readFileSync(file, "utf8");

			expect(content).toContain("search: {");
			expect(content).toContain(middleware);
		},
	);
});
