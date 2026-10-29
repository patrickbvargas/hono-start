import { CheckIcon, CopyIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useCopyToClipboard } from "@/shared/hooks/use-copy-to-clipboard";
import { cn } from "@/shared/lib/utils";
import { Button } from "./button";

interface CopyValueProps {
	value: string | null | undefined;
	label: string;
	children: ReactNode;
}

export function CopyValue({ value, label, children }: CopyValueProps) {
	const { copy, status } = useCopyToClipboard(value);
	return (
		<span className="inline-flex max-w-full items-center gap-1 align-middle">
			<span className="min-w-0 truncate">{children}</span>
			{value?.trim() && (
				<span className="relative inline-flex shrink-0">
					<Button
						type="button"
						variant="ghost"
						size="icon-xs"
						aria-label={`Copiar ${label}`}
						title={`Copiar ${label}`}
						className={cn(
							"text-muted-foreground motion-reduce:transition-none",
							status === "copied" && "text-primary",
						)}
						onClick={() => void copy()}
					>
						{status === "copied" ? (
							<CheckIcon
								aria-hidden="true"
								className="animate-in zoom-in-50 duration-200 motion-reduce:animate-none"
							/>
						) : (
							<CopyIcon aria-hidden="true" />
						)}
					</Button>
					<span
						role="status"
						className={cn(
							"pointer-events-none self-center whitespace-nowrap text-xs font-medium text-muted-foreground",
							status === "idle"
								? "sr-only"
								: "animate-in fade-in slide-in-from-top-1 duration-200 motion-reduce:animate-none",
						)}
					>
						{status === "copied"
							? "Copiado"
							: status === "error"
								? "Não foi possível copiar"
								: ""}
					</span>
				</span>
			)}
		</span>
	);
}
