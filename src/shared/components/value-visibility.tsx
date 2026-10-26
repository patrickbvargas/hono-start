import { EyeIcon, EyeOffIcon } from "lucide-react";
import { createContext, useContext } from "react";
import * as z from "zod";
import { useLocalStorage } from "@/shared/hooks/use-local-storage";
import { Button } from "./ui/button";

const STORAGE_KEY = "values.hidden";
const preferenceSchema = z.boolean();
const ValueVisibilityContext = createContext({
	hidden: false,
	toggle: () => {},
});

interface ValueVisibilityProviderProps {
	children: React.ReactNode;
}

export function ValueVisibilityProvider({
	children,
}: ValueVisibilityProviderProps) {
	// Keep server rendering and hydration private until the preference is loaded.
	const [hidden, setHidden] = useLocalStorage(STORAGE_KEY, true, {
		schema: preferenceSchema,
		defaultValue: false,
	});
	const toggle = () => setHidden((current) => !current);
	return (
		<ValueVisibilityContext.Provider value={{ hidden, toggle }}>
			{children}
		</ValueVisibilityContext.Provider>
	);
}

export function useValueVisibility() {
	return useContext(ValueVisibilityContext);
}

export function ValueVisibilityToggle() {
	const { hidden, toggle } = useValueVisibility();
	const label = hidden ? "Mostrar valores" : "Ocultar valores";
	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={toggle}
			aria-label={label}
			title={label}
			aria-pressed={hidden}
		>
			{hidden ? <EyeOffIcon /> : <EyeIcon />}
		</Button>
	);
}

interface SensitiveValueProps {
	children: React.ReactNode;
}

export function SensitiveValue({ children }: SensitiveValueProps) {
	const { hidden } = useValueVisibility();
	return (
		<span className="inline-block">
			{hidden && <span className="sr-only">Valor oculto</span>}
			<span
				aria-hidden={hidden || undefined}
				className={hidden ? "select-none" : undefined}
			>
				{hidden ? "R$ •••" : children}
			</span>
		</span>
	);
}
