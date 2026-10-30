import type { ClerkPermission } from "./schema";

// Narrow confidentiality guard against misconfigured provider Member grants.
// This grants nothing: current Clerk membership permissions remain authoritative.
export function assertMemberGrantBoundaries(
	role: string,
	permissions: ClerkPermission[],
) {
	if (role !== "org:member") {
		return;
	}
	const forbidden = permissions.some(
		(key) =>
			key.endsWith(":read_all") ||
			key.endsWith(":export_all") ||
			key.startsWith("org:suppliers:") ||
			key.startsWith("org:employees:") ||
			key.startsWith("org:expenses:") ||
			key.startsWith("org:people:") ||
			key.startsWith("org:financial_settings:") ||
			key.startsWith("org:financial_adjustments:") ||
			key === "org:dashboard:read_cash_flow" ||
			(["org:receivables:", "org:payables:", "org:payments:"].some((prefix) =>
				key.startsWith(prefix),
			) &&
				!key.endsWith(":read_assigned") &&
				!key.endsWith(":read_own")) ||
			key === "org:receipts:reverse",
	);
	if (forbidden) {
		throw new Error(
			"Configuração de permissões incompatível com o acesso de membro. Peça ao administrador para revisar o Clerk.",
		);
	}
}
