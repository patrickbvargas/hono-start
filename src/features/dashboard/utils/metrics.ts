export function formatChange(value: number | null) {
	if (value === null) {
		return "Sem base";
	}
	const prefix = value > 0 ? "+" : "";
	return `${prefix}${value.toFixed(0)}%`;
}

export function getChangeTone(value: number | null) {
	if (value !== null && value > 0) {
		return "success" as const;
	}

	if (value !== null && value < 0) {
		return "danger" as const;
	}

	return "default" as const;
}
