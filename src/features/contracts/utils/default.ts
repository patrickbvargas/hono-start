import type {
	ContractAssignmentInput,
	ContractCreateInput,
	ContractRevenueInput,
	ContractUpdateInput,
} from "../schemas/form";
import type { ContractDetail } from "../schemas/model";
import type { ContractSearch } from "../schemas/search";

export const defaultContractAssignmentValues = (): ContractAssignmentInput => ({
	employeeId: "",
	assignmentType: "",
	isActive: true,
});

export const defaultContractRevenueValues = (): ContractRevenueInput => ({
	type: "",
	totalValue: 0,
	downPaymentValue: null,
	paymentStartDate: "",
	totalInstallments: 1,
	isActive: true,
});

export const defaultContractCreateValues = (): ContractCreateInput => ({
	clientId: "",
	processNumber: "",
	legalArea: "",
	status: "ACTIVE",
	feePercentage: 0,
	notes: "",
	allowStatusChange: true,
	isActive: true,
	assignments: [defaultContractAssignmentValues()],
	revenues: [defaultContractRevenueValues()],
});

export const defaultContractUpdateValues = (
	initialValue: ContractDetail,
): ContractUpdateInput => ({
	id: initialValue.id,
	clientId: String(initialValue.clientId),
	processNumber: initialValue.processNumber,
	legalArea: initialValue.legalAreaValue,
	status: initialValue.statusValue,
	feePercentage: initialValue.feePercentage,
	notes: initialValue.notes ?? "",
	allowStatusChange: initialValue.allowStatusChange,
	isActive: initialValue.isActive,
	assignments: initialValue.assignments.map((assignment) => ({
		id: assignment.id,
		employeeId: String(assignment.employeeId),
		assignmentType: assignment.assignmentTypeValue,
		isActive: assignment.isActive,
	})),
	revenues: initialValue.revenues.map((revenue) => ({
		id: revenue.id,
		type: revenue.typeValue,
		totalValue: revenue.totalValue,
		downPaymentValue: revenue.downPaymentValue,
		paymentStartDate: revenue.paymentStartDate.slice(0, 10),
		totalInstallments: revenue.totalInstallments,
		isActive: revenue.isActive,
	})),
});

export const contractSearchDefaults: ContractSearch = {
	page: 1,
	limit: 25,
	column: "createdAt",
	direction: "desc",
	query: "",
	clientId: "",
	legalArea: [],
	contractStatus: [],
	active: "all",
	status: "active",
};
