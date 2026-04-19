import { ScrollShadow } from "@heroui/react";
import { type AnyFormApi, useStore } from "@tanstack/react-form-start";
import { createPortal } from "react-dom";
import { cn } from "@/shared/lib/utils";

interface FormRootProps {
	form: AnyFormApi;
}

export const FormDebug = ({ form }: FormRootProps) => {
	const [values, errors] = useStore(form.store, (state) => [
		state.values,
		state.errors,
	]);

	if (process.env.NODE_ENV !== "development") return null;

	const info = [
		{ title: "Errors", data: errors },
		{ title: "Values", data: values },
	];

	return createPortal(
		<div
			className={cn(
				"fixed top-0 left-0 z-9999 h-full w-0 bg-background overflow-hidden",
				"transition-[width] duration-300 border-r border-r-muted",
				"w-72",
			)}
		>
			<ScrollShadow className="size-full">
				<div className="p-4">
					{info.map(({ title, data }) => (
						<pre
							key={title}
							className="text-xs whitespace-pre-wrap wrap-break-word"
						>
							<code>{JSON.stringify(data, null, 2)}</code>
						</pre>
					))}
				</div>
			</ScrollShadow>
		</div>,
		document.querySelector('[data-slot="modal-backdrop"]') ?? document.body,
	);
};
