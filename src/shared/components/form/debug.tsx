import { type AnyFormApi, useStore } from "@tanstack/react-form-start";
import { ChevronLeft } from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
	Button,
	ScrollArea,
} from "@/shared/components/ui";
import { useLocalStorage } from "@/shared/hooks/use-local-storage";
import { cn } from "@/shared/lib/utils";

interface FormRootProps {
	form: AnyFormApi;
}

export const FormDebug = ({ form }: FormRootProps) => {
	const [values, errors] = useStore(form.store, (state) => [
		state.values,
		state.errors,
	]);
	const [mounted, setMounted] = React.useState(false);
	const [isOpen, setIsOpen] = useLocalStorage<boolean>("RHFDebug.open", false);
	const [expandedKeys, setExpandedKeys] = useLocalStorage<string[]>(
		"RHFDebug.expandedKeys",
		[],
	);

	React.useEffect(() => {
		setMounted(true); // só true no client
	}, []);

	if (process.env.NODE_ENV !== "development") return null;
	if (!mounted) return null; // evita faze no server

	const info = [
		{ title: "Errors", data: errors },
		{ title: "Values", data: values },
	];

	return createPortal(
		<>
			<Button
				size={isOpen ? "sm" : "icon"}
				onClick={() => setIsOpen((prev) => !prev)}
				className={cn(
					"fixed bottom-4 h-10 font-semibold text-xs tracking-wide z-9999",
					isOpen ? "left-72 w-4 rounded-l-none rounded-r-sm" : "left-3 w-10",
				)}
			>
				{isOpen ? <ChevronLeft size={12} /> : "RHF"}
			</Button>
			<div
				className={cn(
					"fixed top-0 left-0 z-9999 h-full w-0 bg-background overflow-hidden",
					"transition-[width] duration-300 border-r border-r-muted",
					isOpen && "w-72",
				)}
			>
				<ScrollArea className="size-full">
					<div className="p-4">
						<Accordion
							multiple
							value={expandedKeys}
							onValueChange={setExpandedKeys}
						>
							{info.map(({ title, data }) => (
								<AccordionItem
									key={title}
									value={title}
									className="first:text-rose-400"
								>
									<AccordionTrigger>{title}</AccordionTrigger>
									<AccordionContent>
										<pre className="text-xs whitespace-pre-wrap wrap-break-word">
											<code>{JSON.stringify(data, null, 2)}</code>
										</pre>
									</AccordionContent>
								</AccordionItem>
							))}
						</Accordion>
					</div>
				</ScrollArea>
			</div>
		</>,
		document.querySelector('[data-slot="dialog-overlay"]') ?? document.body,
	);
};
