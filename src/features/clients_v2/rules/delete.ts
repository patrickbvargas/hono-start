import { CLIENT_ERRORS } from "../constants/errors";

interface ClientDeleteInput {
	activeContractCount: number;
}

export function assertCanBeDeleted({ activeContractCount }: ClientDeleteInput) {
	if (activeContractCount > 0) {
		throw new Error(CLIENT_ERRORS.ALREADY_HAS_ACTIVE_CONTRACTS);
	}
}
