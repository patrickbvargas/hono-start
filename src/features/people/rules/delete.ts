import { PERSON_ERRORS } from "../constants/errors";

interface PersonDeleteInput {
	activeContractCount: number;
}

export function assertCanBeDeleted({ activeContractCount }: PersonDeleteInput) {
	if (activeContractCount > 0) {
		throw new Error(PERSON_ERRORS.ALREADY_HAS_ACTIVE_CONTRACTS);
	}
}
