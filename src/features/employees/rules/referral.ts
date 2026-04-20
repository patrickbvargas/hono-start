import { EMPLOYEE_ERRORS } from "../constants/errors";

interface EmployeeReferralInput {
	referrerPercent: number;
	remunerationPercent: number;
}

export function assertReferralPercentageWithinRemuneration({
	referrerPercent,
	remunerationPercent,
}: EmployeeReferralInput) {
	if (referrerPercent > remunerationPercent) {
		throw new Error(EMPLOYEE_ERRORS.REFERRAL_PERCENTAGE_TOO_HIGH);
	}
}
