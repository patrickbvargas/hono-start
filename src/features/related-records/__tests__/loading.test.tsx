// @vitest-environment jsdom

import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import { Suspense } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { EntityDetail } from "@/shared/components/entity-detail";
import type { OverlayState } from "@/shared/types/overlay";

const loading = vi.hoisted(() => {
	let resolveModule: () => void = () => {};
	let resolveData: () => void = () => {};
	const module = new Promise<void>((resolve) => {
		resolveModule = resolve;
	});
	const data = new Promise<void>((resolve) => {
		resolveData = resolve;
	});
	return { module, data, resolveModule, resolveData, dataReady: false };
});

function LoadedContent() {
	if (!loading.dataReady) {
		throw loading.data;
	}
	return (
		<>
			<EntityDetail.Header>
				<EntityDetail.Title>Cliente relacionado</EntityDetail.Title>
			</EntityDetail.Header>
			<EntityDetail.Footer />
		</>
	);
}

vi.mock("../components/details", async () => {
	await loading.module;
	return {
		RelatedRecordDetails: ({ state }: { state: OverlayState }) => (
			<EntityDetail.Root state={state}>
				<Suspense
					fallback={
						<>
							<EntityDetail.SkeletonHeader />
							<EntityDetail.Footer />
						</>
					}
				>
					<LoadedContent />
				</Suspense>
			</EntityDetail.Root>
		),
	};
});

import { RelatedRecordLink } from "../components/link";

afterEach(cleanup);

it("mounts one drawer after the lazy module loads and retains it as data resolves", async () => {
	const url = window.location.href;
	render(
		<main data-slot="root-container">
			<h1>Contrato de origem</h1>
			<input aria-label="Busca de contratos" defaultValue="PROC-123" />
			<RelatedRecordLink kind="client" id={42}>
				Cliente
			</RelatedRecordLink>
		</main>,
	);

	fireEvent.click(screen.getByRole("button", { name: "Cliente" }));
	expect(
		screen
			.getByRole("button", { name: "Cliente" })
			.getAttribute("aria-expanded"),
	).toBe("true");
	expect(document.querySelector('[data-slot="drawer-content"]')).toBeNull();

	await act(async () => {
		loading.resolveModule();
		await loading.module;
	});
	expect(
		await screen.findByRole("heading", { name: "Carregando detalhes" }),
	).toBeTruthy();
	const drawer = document.querySelector('[data-slot="drawer-content"]');
	expect(drawer).not.toBeNull();
	expect(
		document.querySelectorAll('[data-slot="drawer-content"]'),
	).toHaveLength(1);

	await act(async () => {
		loading.dataReady = true;
		loading.resolveData();
		await loading.data;
	});
	expect(
		await screen.findByRole("heading", { name: "Cliente relacionado" }),
	).toBeTruthy();
	expect(document.querySelector('[data-slot="drawer-content"]')).toBe(drawer);
	expect(window.location.href).toBe(url);

	fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
	expect(document.querySelector('[data-slot="drawer-content"]')).toBeNull();
	expect(
		screen.getByRole("heading", { name: "Contrato de origem" }),
	).toBeTruthy();
	expect(
		(screen.getByLabelText("Busca de contratos") as HTMLInputElement).value,
	).toBe("PROC-123");
});
