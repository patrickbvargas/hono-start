import * as React from "react";
import {
	Legend as RechartsLegend,
	Tooltip as RechartsTooltip,
	ResponsiveContainer,
} from "recharts";
import type {
	Props as LegendContentProps,
	LegendPayload,
} from "recharts/types/component/DefaultLegendContent";
import type {
	NameType,
	Payload,
	ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import type { TooltipContentProps } from "recharts/types/component/Tooltip";
import { cn } from "@/shared/lib/utils";

type ChartTheme = {
	light: string;
	dark: string;
};

type ChartConfigItem = {
	label?: React.ReactNode;
	icon?: React.ComponentType<{ className?: string }>;
	color?: string;
	theme?: ChartTheme;
};

export type ChartConfig = Record<string, ChartConfigItem>;

interface ChartContextValue {
	config: ChartConfig;
}

const ChartContext = React.createContext<ChartContextValue | null>(null);

function useChart() {
	const context = React.useContext(ChartContext);

	if (!context) {
		throw new Error("Chart components must be used inside ChartContainer");
	}

	return context;
}

function getPayloadKey(
	item: Payload<ValueType, NameType> | LegendPayload,
	key?: string,
): string {
	if (
		key &&
		"payload" in item &&
		item.payload &&
		typeof item.payload === "object"
	) {
		const payloadValue = item.payload as Record<string, unknown>;
		const resolved = payloadValue[key];

		if (typeof resolved === "string" || typeof resolved === "number") {
			return String(resolved);
		}
	}

	if ("dataKey" in item && item.dataKey) {
		return String(item.dataKey);
	}

	return String(item.value ?? "");
}

function getPayloadLabel(
	config: ChartConfig,
	item: Payload<ValueType, NameType> | LegendPayload,
	key?: string,
): React.ReactNode {
	const configItem = config[getPayloadKey(item, key)];

	return configItem?.label ?? item.value ?? "";
}

function getPayloadColor(
	item: Payload<ValueType, NameType> | LegendPayload,
	key: string,
): string {
	if ("color" in item && typeof item.color === "string" && item.color) {
		return item.color;
	}

	return `var(--color-${key})`;
}

function getChartVariables(config: ChartConfig) {
	return Object.entries(config).reduce<Record<string, string>>(
		(variables, [key, item]) => {
			const value = item.color ?? item.theme?.light;

			if (!value) {
				return variables;
			}

			variables[`--color-${key}`] = value;

			return variables;
		},
		{},
	);
}

interface ChartContainerProps extends React.ComponentProps<"div"> {
	config: ChartConfig;
	children: React.ReactElement;
}

export function ChartContainer({
	config,
	children,
	className,
	style,
	...props
}: ChartContainerProps) {
	const id = React.useId().replace(/:/g, "");
	const chartVariables = React.useMemo(() => {
		return getChartVariables(config);
	}, [config]);

	return (
		<ChartContext.Provider value={{ config }}>
			<div
				data-chart={id}
				className={cn(
					"`min-h-50 w-full text-xs [&_.recharts-responsive-container]:h-full!",
					className,
				)}
				style={
					{
						...chartVariables,
						...style,
					} as React.CSSProperties
				}
				{...props}
			>
				<ResponsiveContainer width="100%" height="100%">
					{children}
				</ResponsiveContainer>
			</div>
		</ChartContext.Provider>
	);
}

export const ChartTooltip = RechartsTooltip;
export const ChartLegend = RechartsLegend;

interface ChartTooltipContentProps
	extends Partial<
		Omit<TooltipContentProps<ValueType, NameType>, "content" | "payload">
	> {
	className?: string;
	hideIndicator?: boolean;
	hideLabel?: boolean;
	indicator?: "dot" | "line" | "dashed";
	labelKey?: string;
	nameKey?: string;
	payload?: ReadonlyArray<Payload<ValueType, NameType>>;
	valueFormatter?: (value: ValueType | undefined) => React.ReactNode;
}

function TooltipIndicator({
	color,
	type,
}: {
	color: string;
	type: NonNullable<ChartTooltipContentProps["indicator"]>;
}) {
	if (type === "line") {
		return (
			<span
				className="h-2.5 w-3 rounded-sm"
				style={{ backgroundColor: color }}
			/>
		);
	}

	if (type === "dashed") {
		return (
			<span
				className="h-0 w-3 border-t-2 border-dashed"
				style={{ borderColor: color }}
			/>
		);
	}

	return (
		<span
			className="size-2.5 rounded-full"
			style={{ backgroundColor: color }}
		/>
	);
}

export function ChartTooltipContent({
	active,
	className,
	hideIndicator = false,
	hideLabel = false,
	indicator = "dot",
	label,
	labelFormatter,
	nameKey,
	payload,
	formatter,
	valueFormatter,
}: ChartTooltipContentProps) {
	const { config } = useChart();

	if (!active || !payload?.length) {
		return null;
	}

	const tooltipLabel = hideLabel
		? null
		: labelFormatter
			? labelFormatter(label, payload)
			: label;

	return (
		<div
			className={cn(
				"grid min-w-48 gap-2 rounded-lg border border-border/60 bg-popover px-3 py-2 text-xs shadow-md",
				className,
			)}
		>
			{tooltipLabel ? (
				<div className="font-medium text-popover-foreground">
					{tooltipLabel}
				</div>
			) : null}
			<div className="grid gap-1.5">
				{payload
					.filter((item) => !item.hide)
					.map((item, index) => {
						const key = getPayloadKey(item, nameKey);
						const color = getPayloadColor(item, key);
						const formattedValue = formatter
							? formatter(item.value, item.name, item, index, payload)
							: valueFormatter
								? valueFormatter(item.value)
								: item.value?.toLocaleString("pt-BR");

						let valueNode = formattedValue;
						let nameNode = getPayloadLabel(config, item, nameKey);

						if (Array.isArray(formattedValue)) {
							valueNode = formattedValue[0];
							nameNode = formattedValue[1];
						}

						return (
							<div
								className="flex items-center justify-between gap-3"
								key={key}
							>
								<div className="flex items-center gap-2 text-muted-foreground">
									{hideIndicator ? null : (
										<TooltipIndicator color={color} type={indicator} />
									)}
									<span>{nameNode}</span>
								</div>
								<span className="font-medium text-popover-foreground">
									{valueNode}
								</span>
							</div>
						);
					})}
			</div>
		</div>
	);
}

interface ChartLegendContentProps
	extends Partial<Omit<LegendContentProps, "payload">> {
	className?: string;
	hideIcon?: boolean;
	nameKey?: string;
	payload?: ReadonlyArray<LegendPayload>;
}

export function ChartLegendContent({
	className,
	hideIcon = false,
	nameKey,
	payload,
}: ChartLegendContentProps) {
	const { config } = useChart();

	if (!payload?.length) {
		return null;
	}

	return (
		<div
			className={cn(
				"flex flex-wrap items-center justify-center gap-4 pt-3 text-xs text-muted-foreground",
				className,
			)}
		>
			{payload.map((item) => {
				const key = getPayloadKey(item, nameKey);
				const color = getPayloadColor(item, key);
				const Icon = config[key]?.icon;

				return (
					<div className="flex items-center gap-2" key={key}>
						{hideIcon ? null : Icon ? (
							<Icon className="size-3.5" />
						) : (
							<span
								className="size-2.5 rounded-full"
								style={{ backgroundColor: color }}
							/>
						)}
						<span>{getPayloadLabel(config, item, nameKey)}</span>
					</div>
				);
			})}
		</div>
	);
}
