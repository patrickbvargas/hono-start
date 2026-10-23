import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  // Separator,
} from "@/shared/components/ui";
import { CHART_HELP } from "../../constants/chart-help";
import type { DashboardBreakdownItem } from "../../schemas/model";
import { ChartHelp } from "../chart-help";
import { BreakdownBarChart } from "./bar";
import { BreakdownDonutChart } from "./donut";

// import { BreakdownList } from "./list";

interface DashboardBreakdownChartProps {
  title: string;
  items: DashboardBreakdownItem[];
  emptyLabel: string;
  variant: "bar" | "donut";
}

export function DashboardBreakdownChart({
  title,
  items,
  emptyLabel,
  variant,
}: DashboardBreakdownChartProps) {
  return (
    <Card className="min-h-80">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          {title}
          <ChartHelp
            title={title}
            description={
              CHART_HELP[title] ??
              "Valores consolidados para os filtros e período selecionados."
            }
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          <>
            {variant === "bar" ? (
              <BreakdownBarChart items={items} />
            ) : (
              <BreakdownDonutChart items={items} />
            )}
            {/* <Separator className="hidden sm:block" />
                        <BreakdownList items={items} /> */}
          </>
        )}
      </CardContent>
    </Card>
  );
}
