import { Card, CardContent, CardHeader } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";
import type { PendingWork, PendingWorkPage } from "../../schemas/model";

interface PendingWorkSummaryProps {
	data: PendingWorkPage;
	onSelectSeverity?: (severity: PendingWork["severity"] | null) => void;
}

export function PendingWorkSummary({
	data,
	onSelectSeverity,
}: PendingWorkSummaryProps) {
	const highColor =
		data.high > 0 ? "text-red-700 dark:text-red-400" : undefined;
	const mediumColor =
		data.medium > 0 ? "text-amber-800 dark:text-amber-400" : undefined;
	const metrics = [
		{
			label: "Pendências",
			severity: null,
			value: data.total,
			color:
				highColor ??
				mediumColor ??
				(data.low > 0 ? "text-blue-700 dark:text-blue-400" : undefined),
		},
		{
			label: "Alta criticidade",
			value: data.high,
			color: highColor,
			severity: "high" as const,
		},
		{
			label: "Média criticidade",
			value: data.medium,
			color: mediumColor,
			severity: "medium" as const,
		},
		{
			label: "Baixa criticidade",
			severity: "low" as const,
			value: data.low,
			color: data.low > 0 ? "text-blue-700 dark:text-blue-400" : undefined,
		},
		{ label: "Contratos afetados", value: data.contracts },
	];
	return (
		<section
			aria-label="Resumo das pendências filtradas"
			hidden
			className="shrink-0 grid-cols-2 gap-3 md:grid-cols-4 2xl:grid-cols-5"
		>
			{metrics.map((metric) => (
				<Card key={metric.label} className="relative gap-2">
					{onSelectSeverity && metric.severity !== undefined && (
						<button
							type="button"
							aria-label={
								metric.severity === null
									? "Mostrar todas as criticidades"
									: `Filtrar ${metric.label.toLowerCase()}`
							}
							onClick={() => onSelectSeverity(metric.severity ?? null)}
							className="absolute inset-0 cursor-pointer rounded-xl transition-[background-color,box-shadow] hover:bg-accent/30 hover:ring-2 hover:ring-ring/60 focus-visible:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						/>
					)}
					<CardHeader className="pointer-events-none relative min-h-6">
						<p className="text-sm text-muted-foreground">{metric.label}</p>
					</CardHeader>
					<CardContent className="pointer-events-none relative flex flex-col gap-2 pt-0">
						<p
							className={cn(
								"text-2xl font-semibold tabular-nums",
								metric.color,
							)}
						>
							{metric.value}
						</p>
					</CardContent>
				</Card>
			))}
		</section>
	);
}
