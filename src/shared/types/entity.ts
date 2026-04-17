import type { EntityId } from "../schemas/entity";

export interface EntityTenantParams {
  firmId: EntityId;
}

export interface EntityUniqueParams extends EntityTenantParams {
  id: EntityId;
}

export interface EntityInputParams<T> extends EntityTenantParams {
  input: T;
}

export interface EntitySearchParams<T> extends EntityTenantParams {
  search: T;
}

export interface EntityFilterParams<T> extends EntityTenantParams {
  filter: T;
}
