import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const features = [
	"clients",
	"employees",
	"contracts",
	"fees",
	"expenses",
	"remunerations",
	"attachments",
];

describe("business form UI contract", () => {
	it.each(features)("keeps %s on the shared form presentation", (feature) => {
		const source = readFileSync(
			`src/features/${feature}/components/form/index.tsx`,
			"utf8",
		);
		expect(source).toContain("<EntityForm");
		expect(source).toContain("<FormSection");
		expect(source).not.toMatch(/<FormSection(?!\s+variant="plain")/);
		expect(source).toContain("<form.Submit");
		expect(source).not.toContain("showDebug");
		expect(source).not.toMatch(/grid (?:items-end )?gap-[35]/);
		expect(source).not.toMatch(/label="% /);
		expect(source).not.toContain('label="Observação"');
	});

	it.each(["clients", "employees"])(
		"keeps the %s lifecycle option in the form flow",
		(feature) => {
			const source = readFileSync(
				`src/features/${feature}/components/form/index.tsx`,
				"utf8",
			);
			expect(source).not.toContain('<FormSection title="Opções">');
			expect(source).not.toContain("footerStart=");
			expect(source).toMatch(
				/<FormSection[^>]*>[\s\S]*?<form.AppField name="isActive">[\s\S]*?<\/FormSection>/,
			);
			expect(source).toContain('label="Ativo"');
		},
	);
	it.each(["contracts", "fees", "expenses", "remunerations"])(
		"omits activation management from %s forms, filters, tables and cards",
		(feature) => {
			for (const component of ["form", "filter", "table", "list"]) {
				const source = readFileSync(
					`src/features/${feature}/components/${component}/index.tsx`,
					"utf8",
				);
				expect(source).not.toContain('name="isActive"');
				expect(source).not.toContain('name="active"');
				expect(source).not.toContain('accessor("isActive"');
				expect(source).not.toContain("ENTITY_ACTIVE_FILTER_OPTIONS");
				expect(source).not.toContain("<EntityStatus");
			}
		},
	);
});
