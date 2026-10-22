import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { hasPermission, useLoggedUserSession } from "@/shared/session";
import { getEmployeeRolesQueryOptions } from "../api/queries";
import type { EmployeeDetail } from "../schemas/model";
import { useEmployeeGrantAccess } from "./use-grant-access";
import { useEmployeeRevokeAccess } from "./use-revoke-access";

export function useEmployeeAccountAccess(employee: EmployeeDetail) {
	const session = useLoggedUserSession();
	const allowed =
		hasPermission(session, "org:accounts:manage") && !employee.isSoftDeleted;
	const roles = useQuery({
		...getEmployeeRolesQueryOptions(),
		enabled: allowed,
	});
	const [role, setRole] = useState("");
	const [revokeOpen, setRevokeOpen] = useState(false);
	const grant = useEmployeeGrantAccess();
	const revoke = useEmployeeRevokeAccess();
	async function handleRevoke() {
		if (await revoke.handleConfirm(employee.id)) {
			setRevokeOpen(false);
		}
	}
	return {
		allowed,
		roles,
		role,
		setRole,
		revokeOpen,
		setRevokeOpen,
		grant,
		revoke,
		handleRevoke,
		handleGrant: () => grant.handleConfirm(employee.id, role),
	};
}
