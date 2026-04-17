import { describe, expect, it } from "vitest";
import * as clients from "@/features/clients";
import * as contracts from "@/features/contracts";
import * as employees from "@/features/employees";
import * as fees from "@/features/fees";
import * as remunerations from "@/features/remunerations";

describe("feature public barrels", () => {
	it("keeps client and employee barrels route-focused", () => {
		expect(clients).toHaveProperty("getClientsOptions");
		expect(clients).toHaveProperty("ClientForm");
		expect(clients).not.toHaveProperty("useClientForm");

		expect(employees).toHaveProperty("getEmployeesQueryOptions");
		expect(employees).toHaveProperty("EmployeeForm");
		expect(employees).not.toHaveProperty("useEmployeeForm");
	});

	it("keeps contract and fee barrels aligned with the same minimal surface", () => {
		expect(contracts).toHaveProperty("getContractsOptions");
		expect(contracts).toHaveProperty("ContractForm");
		expect(contracts).not.toHaveProperty("createContractOptions");
		expect(contracts).not.toHaveProperty("useContractOptions");

		expect(fees).toHaveProperty("getFeesOptions");
		expect(fees).toHaveProperty("FeeForm");
		expect(fees).not.toHaveProperty("createFeeOptions");
		expect(fees).not.toHaveProperty("useFeeForm");
	});

	it("keeps remuneration barrel minimal while preserving the route-level export hook", () => {
		expect(remunerations).toHaveProperty("getRemunerationsOptions");
		expect(remunerations).toHaveProperty("RemunerationForm");
		expect(remunerations).toHaveProperty("useRemunerationExport");
		expect(remunerations).not.toHaveProperty("updateRemunerationOptions");
		expect(remunerations).not.toHaveProperty("useRemunerationForm");
	});
});
