export type NonEmptyKeys<T> = [keyof T, ...(keyof T)[]];
