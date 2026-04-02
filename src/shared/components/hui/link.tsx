export type { LinkProps } from "@heroui/react";

import { Link as HLink } from "@heroui/react";
import { createLink } from "@tanstack/react-router";

const CustomLink = createLink(HLink);

export const Link = Object.assign(CustomLink, {
	Icon: HLink.Icon,
});
