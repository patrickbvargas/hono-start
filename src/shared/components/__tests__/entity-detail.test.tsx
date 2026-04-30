// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import * as React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { EntityDetail } from "../entity-detail";

const OPEN_STATE = {
	isOpen: true,
	onOpenChange: () => {},
	close: () => {},
};

const pendingContent = new Promise<never>(() => {});

function SuspendsForever(): React.ReactNode {
	throw pendingContent;
}

describe("EntityDetail", () => {
	afterEach(() => {
		cleanup();
	});

	it("keeps surrounding content visible while detail content suspends", () => {
		render(
			<div>
				<div>Tabela de clientes</div>
				<EntityDetail.Root state={OPEN_STATE}>
					<React.Suspense
						fallback={
							<EntityDetail.Content>
								<EntityDetail.Header>
									<EntityDetail.Title>
										<EntityDetail.SkeletonTitle />
									</EntityDetail.Title>
								</EntityDetail.Header>
								<EntityDetail.Body>
									<EntityDetail.SkeletonFields rows={2} />
								</EntityDetail.Body>
								<EntityDetail.Footer />
							</EntityDetail.Content>
						}
					>
						<SuspendsForever />
					</React.Suspense>
				</EntityDetail.Root>
			</div>,
		);

		expect(screen.getByText("Tabela de clientes")).not.toBeNull();
		expect(document.querySelectorAll('[data-slot="skeleton"]').length).toBe(5);
		expect(screen.getByRole("button", { name: "Fechar" })).not.toBeNull();
	});
});
