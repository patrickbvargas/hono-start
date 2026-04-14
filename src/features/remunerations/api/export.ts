import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/shared/lib/prisma";
import {
	getServerLoggedUserSession,
	getServerScope,
	isAdminSession,
} from "@/shared/session";
import { remunerationExportInputSchema } from "../schemas/form";
import {
	buildRemunerationPdf,
	buildRemunerationSpreadsheet,
	createRemunerationExportFileName,
} from "../utils/export";
import {
	buildRemunerationWhere,
	getRemunerationOrderBy,
	mapRemunerations,
	remunerationListInclude,
} from "./query";

interface RemunerationExportResult {
	fileName: string;
	mimeType: string;
	contentBase64: string;
}

const exportRemunerations = createServerFn({ method: "POST" })
	.inputValidator(remunerationExportInputSchema)
	.handler(async ({ data }): Promise<RemunerationExportResult> => {
		try {
			const session = getServerLoggedUserSession();
			const scope = getServerScope("remuneration");
			const where = buildRemunerationWhere({
				firmId: scope.firmId,
				employeeId: scope.employeeId,
				filter: data,
				isAdmin: isAdminSession(session),
			});

			const remunerations = await prisma.remuneration.findMany({
				where,
				include: remunerationListInclude,
				orderBy: getRemunerationOrderBy(data),
			});
			const mapped = await mapRemunerations(remunerations);
			const fileName = createRemunerationExportFileName(data.format);

			if (data.format === "pdf") {
				return {
					fileName,
					mimeType: "application/pdf",
					contentBase64: buildRemunerationPdf(mapped).toString("base64"),
				};
			}

			return {
				fileName,
				mimeType: "text/csv;charset=utf-8",
				contentBase64: Buffer.from(
					buildRemunerationSpreadsheet(mapped),
					"utf8",
				).toString("base64"),
			};
		} catch (error) {
			console.error("[exportRemunerations]", error);
			throw new Error("Erro ao exportar remunerações");
		}
	});

export const exportRemunerationsOptions = () =>
	mutationOptions({
		mutationFn: exportRemunerations,
	});
