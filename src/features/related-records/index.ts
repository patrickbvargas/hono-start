import { lazy } from "react";

export const RelatedRecordDetails = lazy(() =>
	import("./components/details").then((module) => ({
		default: module.RelatedRecordDetails,
	})),
);
export { RelatedRecordLink } from "./components/link";
