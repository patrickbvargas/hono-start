import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const APP_ROUTE_FILES = [
	"src/routes/_app/visao-operacional.tsx",
	"src/routes/_app/visao-financeira.tsx",
	"src/routes/_app/pessoas.tsx",
	"src/routes/_app/contratos.tsx",
	"src/routes/_app/auditoria.tsx",
];

describe("app route error boundaries", () => {
	it.each(APP_ROUTE_FILES)(
		"keeps route errors inside app content for %s",
		(routeFile) => {
			const routeSource = readFileSync(resolve(routeFile), "utf8");

			expect(routeSource).toContain(
				'import { RouteError } from "@/shared/components/route-error";',
			);
			expect(routeSource).toContain("errorComponent: ({ error }) =>");
			expect(routeSource).toContain("<RouteError");
		},
	);
});
