import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const routeCases = [
	{
		file: resolve(import.meta.dirname, "../routes/_app/pessoas.tsx"),
		middleware: "stripSearchParams(personSearchDefaults)",
	},
	{
		file: resolve(import.meta.dirname, "../routes/_app/contratos.tsx"),
		middleware: "stripSearchParams(contractSearchDefaults)",
	},
	{
		file: resolve(import.meta.dirname, "../routes/_app/auditoria.tsx"),
		middleware: "stripSearchParams(auditLogSearchDefaults)",
	},
	{
		file: resolve(import.meta.dirname, "../routes/_app/visao-operacional.tsx"),
		middleware: "stripSearchParams(dashboardSearchDefaults)",
	},
	{
		file: resolve(import.meta.dirname, "../routes/_app/visao-financeira.tsx"),
		middleware: "stripSearchParams(financialOverviewSearchDefaults)",
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
