import { lazy } from "react";

export const RelatedRecordDetails = lazy(() =>
	import("./components/details").then((module) => ({
		default: module.RelatedRecordDetails,
	})),
);
export { RelatedRecordActions } from "./components/actions";
export { RelatedRecordLink } from "./components/link";
