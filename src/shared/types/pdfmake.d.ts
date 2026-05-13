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

	interface VirtualFileSystem {
		existsSync(filename: string): boolean;
		readFileSync(filename: string, options?: BufferEncoding): Buffer | string;
		writeFileSync(filename: string, content: Buffer | string): void;
	}

	interface PdfMake {
		addFonts(fonts: Record<string, FontFamilyDefinition>): void;
		createPdf(docDefinition: object): PdfDocument;
		setLocalAccessPolicy(callback: (targetPath: string) => boolean): void;
		setUrlAccessPolicy(callback: (url: string) => boolean): void;
		virtualfs: VirtualFileSystem;
	}

	const pdfmake: PdfMake;

	export default pdfmake;
}
