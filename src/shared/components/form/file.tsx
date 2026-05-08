import { UploadIcon } from "lucide-react";
import { useRef, useState } from "react";
import { Button, FieldWrapper, Spinner } from "@/shared/components/ui";
import { useFieldContext } from "@/shared/hooks/use-app-form";
import { cn } from "@/shared/lib/utils";
import type { FieldCommonProps } from "@/shared/types/field";

interface FormFileProps
	extends FieldCommonProps,
		Omit<
			React.ComponentPropsWithoutRef<"input">,
			"type" | "value" | "onChange"
		> {
	browseLabel?: string;
	dropDescription?: string;
	emptyTitle?: string;
	isLoading?: boolean;
	loadingText?: string;
	onValueChange?: (file: File | null) => Promise<void> | void;
}

function formatSelectedFileSize(bytes: number) {
	if (bytes < 1024) {
		return `${bytes} B`;
	}

	if (bytes < 1024 * 1024) {
		return `${(bytes / 1024).toFixed(1)} KB`;
	}

	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const FormFile = ({
	label,
	description,
	isRequired,
	isDisabled,
	classNames,
	accept,
	browseLabel = "Selecionar arquivo",
	dropDescription,
	emptyTitle = "Arraste e solte arquivo aqui",
	isLoading = false,
	loadingText = "Preparando arquivo...",
	onValueChange,
	...props
}: FormFileProps) => {
	const field = useFieldContext<File | null>();
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [isDragActive, setIsDragActive] = useState(false);

	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

	const selectedFile = field.state.value;
	const selectedDescription = selectedFile
		? `${selectedFile.name} (${formatSelectedFileSize(selectedFile.size)})`
		: null;

	function handleFileChange(file: File | null) {
		field.handleChange(file);
		field.handleBlur();
		setIsDragActive(false);
		void onValueChange?.(file);
	}

	return (
		<FieldWrapper
			id={field.name}
			label={label}
			description={description}
			isRequired={isRequired}
			errors={field.state.meta.errors}
			data-invalid={isInvalid}
			className={classNames?.wrapper}
		>
			<div
				role="presentation"
				className={cn(
					"flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 px-6 py-8 text-center transition-colors",
					"data-[drag-active=true]:border-primary data-[drag-active=true]:bg-primary/5",
					"aria-invalid:border-destructive aria-invalid:bg-destructive/5",
					isDisabled || isLoading
						? "cursor-not-allowed opacity-60"
						: "cursor-pointer",
				)}
				data-drag-active={isDragActive}
				aria-invalid={isInvalid}
				onClick={() => {
					if (!isDisabled && !isLoading) {
						inputRef.current?.click();
					}
				}}
				onDragOver={(event) => {
					if (isDisabled || isLoading) {
						return;
					}

					event.preventDefault();
					setIsDragActive(true);
				}}
				onDragLeave={(event) => {
					if (
						event.currentTarget.contains(event.relatedTarget as Node | null)
					) {
						return;
					}

					setIsDragActive(false);
				}}
				onDrop={(event) => {
					if (isDisabled || isLoading) {
						return;
					}

					event.preventDefault();
					const file = event.dataTransfer.files.item(0);
					void handleFileChange(file);
				}}
			>
				<input
					{...props}
					ref={inputRef}
					id={field.name}
					name={field.name}
					type="file"
					accept={accept}
					className="sr-only"
					disabled={isDisabled || isLoading}
					onBlur={field.handleBlur}
					onChange={(event) => {
						void handleFileChange(event.target.files?.item(0) ?? null);
					}}
				/>
				<div className="flex size-14 items-center justify-center rounded-full border border-border bg-background">
					{isLoading ? (
						<Spinner
							className="size-5 text-foreground"
							aria-label={loadingText}
						/>
					) : (
						<UploadIcon className="size-5 text-foreground" />
					)}
				</div>
				<div className="space-y-1">
					<p className="font-medium text-sm">{emptyTitle}</p>
					<p className="text-muted-foreground text-sm">
						{isLoading ? loadingText : (selectedDescription ?? dropDescription)}
					</p>
				</div>
				<Button
					type="button"
					variant="outline"
					onClick={(event) => {
						event.stopPropagation();
						if (!isLoading) {
							inputRef.current?.click();
						}
					}}
					disabled={isDisabled || isLoading}
				>
					{isLoading ? "Carregando..." : browseLabel}
				</Button>
			</div>
		</FieldWrapper>
	);
};
