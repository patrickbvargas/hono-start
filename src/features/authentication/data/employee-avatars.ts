import { clerkClient } from "@clerk/tanstack-react-start/server";
import { createServerOnlyFn } from "@tanstack/react-start";
import * as z from "zod";
import { prisma } from "@/shared/lib/prisma";
import { type Option, optionSchema } from "@/shared/schemas/option";

const bindingSchema = z.object({ personId: z.number().int().positive() });
const photoSchema = z.url({ protocol: /^https$/ });
const CACHE_TTL = 60_000;
const FAILURE_TTL = 10_000;
const PAGE_SIZE = 100;

let cachedPhotos = new Map<number, string>();
let expiresAt = 0;
let pendingPhotos: Promise<Map<number, string>> | undefined;

async function loadPhotos() {
	const photos = new Map<number, string>();
	const seen = new Set<number>();
	const client = clerkClient();
	let offset = 0;
	while (true) {
		const { data, totalCount } = await client.users.getUserList({
			limit: PAGE_SIZE,
			offset,
			orderBy: "+created_at",
		});
		for (const user of data) {
			const binding = bindingSchema.safeParse(user.privateMetadata);
			if (!binding.success) {
				continue;
			}
			const { personId } = binding.data;
			if (seen.has(personId)) {
				photos.delete(personId);
				continue;
			}
			seen.add(personId);
			const photo = photoSchema.safeParse(user.imageUrl);
			if (user.hasImage && photo.success) {
				photos.set(personId, photo.data);
			}
		}
		offset += data.length;
		if (offset >= totalCount) {
			return photos;
		}
		if (data.length === 0) {
			throw new Error("Incomplete Clerk avatar page");
		}
	}
}

async function getPhotos() {
	if (Date.now() < expiresAt) {
		return cachedPhotos;
	}
	if (!pendingPhotos) {
		pendingPhotos = loadPhotos()
			.then((photos) => {
				cachedPhotos = photos;
				expiresAt = Date.now() + CACHE_TTL;
				return photos;
			})
			.catch(() => {
				cachedPhotos = new Map();
				expiresAt = Date.now() + FAILURE_TTL;
				return cachedPhotos;
			})
			.finally(() => {
				pendingPhotos = undefined;
			});
	}
	return pendingPhotos;
}

export const enrichEmployeeAvatars = createServerOnlyFn(
	async (options: Option[]): Promise<Option[]> => {
		if (options.length === 0) {
			return [];
		}
		const photos = await getPhotos();
		const profiles = await prisma.employeeProfile.findMany({
			where: {
				id: { in: options.map((option) => option.id) },
				person: { isActive: true, deletedAt: null },
				isActive: true,
				deletedAt: null,
			},
			select: { id: true, personId: true },
		});
		const peopleByProfile = new Map(
			profiles.map((profile) => [profile.id, profile.personId]),
		);
		return optionSchema.array().parse(
			options.map((option) => ({
				id: option.id,
				value: option.value,
				label: option.label,
				isActive: !option.isDisabled,
				imageUrl: photos.get(peopleByProfile.get(option.id) ?? -1),
			})),
		);
	},
);
