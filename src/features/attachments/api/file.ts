import { readAttachmentFile } from "@/shared/lib/attachment-storage";

import {
	getRequiredServerLoggedUserSession,
	getServerScope,
} from "@/shared/session/server";

import {
	assertAttachmentOwnerExists,
	getAttachmentAccessById,
} from "../data/queries";

import { assertAttachmentOwnerReadAccess } from "../rules/access";

export async function handleAttachmentFile(id: string) {
	const headers = {
		"Cache-Control": "private, no-store",
		"X-Content-Type-Options": "nosniff",
	};

	try {
		const session = await getRequiredServerLoggedUserSession();

		const { firmId } = await getServerScope("attachment");

		if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) {
			return new Response("Anexo não encontrado", { status: 404, headers });
		}

		const attachment = await getAttachmentAccessById(firmId, Number(id));

		if (!attachment || attachment.deletedAt) {
			return new Response("Anexo não encontrado", { status: 404, headers });
		}

		const owner = await assertAttachmentOwnerExists({
			firmId,
			input: attachment.ownerInput,
		});

		assertAttachmentOwnerReadAccess(session, owner);

		const data = await readAttachmentFile({ path: attachment.storagePath });

		return new Response(new Uint8Array(data), {
			headers: {
				...headers,

				"Content-Type": attachment.mimeType,

				"Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(attachment.fileName).replace(/['()*]/g, (char) => `%${char.charCodeAt(0).toString(16)}`)}`,
			},
		});
	} catch (error) {
		console.error("[attachment:file]", error);

		const missing = (error as NodeJS.ErrnoException)?.code === "ENOENT";

		return new Response(
			missing ? "Anexo não encontrado" : "Não foi possível acessar o anexo",
			{ status: missing ? 404 : 403, headers },
		);
	}
}
