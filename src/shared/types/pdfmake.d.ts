declare module "pdfmake" {
	interface FontFamilyDefinition {
		bold: string;
		bolditalics: string;
		italics: string;
		normal: string;
	}

	interface PdfDocument {
		getBuffer(): Promise<Buffer>;
	}

	interface PdfMake {
		addFonts(fonts: Record<string, FontFamilyDefinition>): void;
		createPdf(docDefinition: object): PdfDocument;
		setLocalAccessPolicy(callback: (targetPath: string) => boolean): void;
		setUrlAccessPolicy(callback: (url: string) => boolean): void;
	}

	const pdfmake: PdfMake;

	export default pdfmake;
}
