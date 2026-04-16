import type { EntityId } from "../schemas/entity";

export interface EntityInputParams<T> {
	firmId: EntityId;
	input: T;
}

export interface EntityUniqueParams {
	firmId: EntityId;
	id: EntityId;
}
