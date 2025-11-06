
import { GenerativePart } from '../types';

// Use globalThis to access the pdfjsLib object from the CDN script
declare const globalThis: {
    pdfjsLib: any;
};

// Set the workerSrc for pdf.js
if (globalThis.pdfjsLib) {
    globalThis.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.3.136/pdf.worker.min.mjs';
}

const fileToGenerativePart = async (file: File): Promise<GenerativePart[]> => {
    if (file.type === 'application/pdf') {
        return pdfToGenerativeParts(file);
    } else if (file.type.startsWith('image/')) {
        return [await imageToGenerativePart(file)];
    } else {
        throw new Error('Unsupported file type. Please upload an image or PDF.');
    }
};

const imageToGenerativePart = (file: File): Promise<GenerativePart> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64Data = (reader.result as string).split(',')[1];
            if (base64Data) {
                resolve({
                    inlineData: {
                        data: base64Data,
                        mimeType: file.type,
                    },
                });
            } else {
                reject(new Error("Failed to read file as base64."));
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};

const pdfToGenerativeParts = async (file: File): Promise<GenerativePart[]> => {
    if (!globalThis.pdfjsLib) {
        throw new Error("PDF.js library is not loaded. Please check the script tag in your HTML.");
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await globalThis.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;
    const imageParts: GenerativePart[] = [];
    const quality = 0.8; // JPG quality

    for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) {
            throw new Error("Could not get canvas context.");
        }
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport: viewport }).promise;

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const base64Data = dataUrl.split(',')[1];
        if (base64Data) {
            imageParts.push({
                inlineData: {
                    data: base64Data,
                    mimeType: 'image/jpeg',
                },
            });
        }
    }
    return imageParts;
};

export { fileToGenerativePart };
