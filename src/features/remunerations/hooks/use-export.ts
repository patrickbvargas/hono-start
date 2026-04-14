import { useMutation } from "@tanstack/react-query";
import * as React from "react";
import { toast } from "@/shared/lib/toast";
import { exportRemunerationsOptions } from "../api/export";
import type { RemunerationSearch } from "../schemas/search";

type ExportFormat = "pdf" | "spreadsheet";

function downloadBase64File(params: {
	contentBase64: string;
	fileName: string;
	mimeType: string;
}) {
	const binary = atob(params.contentBase64);
	const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
	const blob = new Blob([bytes], { type: params.mimeType });
	const url = window.URL.createObjectURL(blob);
	const anchor = document.createElement("a");

	anchor.href = url;
	anchor.download = params.fileName;
	document.body.append(anchor);
	anchor.click();
	anchor.remove();
	window.URL.revokeObjectURL(url);
}

export function useRemunerationExport(search: RemunerationSearch) {
	const mutation = useMutation(exportRemunerationsOptions());
	const [pendingFormat, setPendingFormat] = React.useState<ExportFormat | null>(
		null,
	);

	const handleExport = async (format: ExportFormat) => {
		try {
			setPendingFormat(format);
			const file = await mutation.mutateAsync({
				data: {
					...search,
					format,
				},
			});

			downloadBase64File(file);
			toast.success("Exportação concluída com sucesso.");
		} catch (error) {
			toast.danger(
				error instanceof Error
					? error.message
					: "Ocorreu um erro inesperado ao exportar as remunerações",
			);
		} finally {
			setPendingFormat(null);
		}
	};

	return {
		handleExport,
		isPending: mutation.isPending,
		pendingFormat,
	};
}
