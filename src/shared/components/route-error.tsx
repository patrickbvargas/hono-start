interface RouteErrorProps {
	error: unknown;
}

export const RouteError = ({ error }: RouteErrorProps) => {
	const message =
		error instanceof Error ? error.message : "Ocorreu um erro inesperado.";

	return (
		<div className="flex flex-col items-center justify-center gap-4 p-8">
			<h2 className="text-lg font-semibold text-destructive">Erro</h2>
			<p className="text-sm text-muted-foreground">{message}</p>
		</div>
	);
};
