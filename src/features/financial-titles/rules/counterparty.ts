import { FINANCIAL_TITLE_ERRORS } from "../constants/errors";

interface Counterparty {
	isActive: boolean;
	person: { isActive: boolean; deletedAt: Date | null };
}

export function assertCounterpartyActive(
	profile: Counterparty | null,
): asserts profile is Counterparty {
	if (
		!profile?.isActive ||
		!profile.person.isActive ||
		profile.person.deletedAt
	) {
		throw new Error(FINANCIAL_TITLE_ERRORS.COUNTERPARTY_UNAVAILABLE);
	}
}
