import { MinusIcon, PlusIcon } from "lucide-react";
import { Button, Group, Input, NumberField } from "react-aria-components";
import { cn } from "@/shared/lib/utils";
import { buttonVariants } from "./button";
import { inputVariants } from "./input";
import {
	InputGroupAddon,
	inputGroupButtonVariants,
	inputGroupVariants,
} from "./input-group";

function InputNumber({
	formatOptions = {
		style: "decimal",
		currency: "BRL",
	},
	isInvalid,
	className,
	...props
}: React.ComponentPropsWithoutRef<typeof NumberField>) {
	return (
		<NumberField formatOptions={formatOptions} isInvalid={isInvalid} {...props}>
			<Group
				aria-invalid={isInvalid}
				className={cn(
					inputGroupVariants(),
					"aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
					"has-disabled:opacity-100 has-disabled:bg-transparent dark:has-disabled:bg-input/30",
					className,
				)}
			>
				<InputGroupAddon>
					<Button
						slot="decrement"
						className={cn(
							buttonVariants({ variant: "ghost" }),
							inputGroupButtonVariants({ size: "icon-xs" }),
						)}
					>
						<MinusIcon size={16} />
					</Button>
				</InputGroupAddon>
				<Input
					aria-invalid={isInvalid}
					className={cn(
						inputVariants(),
						"flex-1 rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0 disabled:bg-transparent aria-invalid:ring-0 dark:bg-transparent dark:disabled:bg-transparent text-center",
					)}
				/>
				<InputGroupAddon align="inline-end">
					<Button
						slot="increment"
						className={cn(
							buttonVariants({ variant: "ghost" }),
							inputGroupButtonVariants({ size: "icon-xs" }),
						)}
					>
						<PlusIcon size={16} />
					</Button>
				</InputGroupAddon>
			</Group>
		</NumberField>
	);
}

export { InputNumber };
