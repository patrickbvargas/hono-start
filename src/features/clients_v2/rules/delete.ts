import { CLIENT_ERRORS } from "../constants/errors";

export function assertClientCanBeDeleted(activeContractCount: number) {
	if (activeContractCount > 0) {
		throw new Error(CLIENT_ERRORS.CLIENT_ALREADY_HAS_ACTIVE_CONTRACTS);
	}
}
