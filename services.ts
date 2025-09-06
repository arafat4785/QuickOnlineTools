
import { GoogleGenAI } from "@google/genai";

// This tells TypeScript that PDFLib is a global variable from the CDN script
declare const PDFLib: any;

// --- Gemini API Service ---
const getAiClient = () => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const geminiImageToText = async (base64Image: string, mimeType: string) => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { text: "Extract all text from this image. If there is no text, respond with 'No text found.'." },
                { inlineData: { mimeType, data: base64Image } }
            ]
        }
    });
    return response.text;
};

export const geminiTextToImage = async (prompt: string) => {
    const ai = getAiClient();
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt,
        config: { numberOfImages: 1, outputMimeType: 'image/png' },
    });
    return response.generatedImages[0].image.imageBytes;
};


export const geminiBlogWriter = async (topic: string, keywords: string) => {
    const ai = getAiClient();
    const prompt = `Write a high-quality, SEO-friendly blog post about "${topic}". Incorporate the following keywords naturally: ${keywords}. The blog post should have a compelling title, an introduction, several sub-headings with detailed content, and a concluding paragraph. Format the output in Markdown.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text;
};

export const geminiEmailWriter = async (recipient: string, subject: string, intent: string) => {
    const ai = getAiClient();
    const prompt = `Compose a professional email.
    Recipient's role or relationship: ${recipient}
    Subject: ${subject}
    Key message/intent: ${intent}
    
    Please write a clear, concise, and professional email based on the information above.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text;
};


export const geminiFlyerMaker = async (title: string, date: string, location: string, description: string) => {
    const ai = getAiClient();
    const prompt = `
    Generate a single HTML file's body content using Tailwind CSS for a professional and visually appealing flyer for the following event.
    - Event Title: ${title}
    - Date & Time: ${date}
    - Location: ${location}
    - Description: ${description}
    
    The design should be modern and clean, enclosed within a single parent div. Use classes for a professional color scheme (e.g., bg-slate-100, text-indigo-700), good typography, and layout. Do not include <!DOCTYPE>, <html>, <head>, or <body> tags. Provide only the HTML for the flyer content itself.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    
    let htmlContent = response.text;
    // Clean up Gemini's response to be pure HTML
    htmlContent = htmlContent.replace(/^```html\n/, '').replace(/\n```$/, '');
    return htmlContent;
};


// --- File Handling Service ---
export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]); // remove the data:mime/type;base64, part
        };
        reader.onerror = error => reject(error);
    });
};

export const downloadFile = (data: Uint8Array | string, filename: string, mimeType?: string) => {
    const blob = (typeof data === 'string')
        ? new Blob([data], { type: mimeType || 'text/plain' })
        : new Blob([data], { type: mimeType || 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// --- PDF Service ---

export const mergePdfs = async (files: File[]): Promise<Uint8Array> => {
    const { PDFDocument } = PDFLib;
    const mergedPdf = await PDFDocument.create();
    for (const file of files) {
        const pdfBytes = await file.arrayBuffer();
        const pdf = await PDFDocument.load(pdfBytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
    }
    return mergedPdf.save();
};

export const imageToPdf = async (files: File[]): Promise<Uint8Array> => {
    const { PDFDocument } = PDFLib;
    const pdfDoc = await PDFDocument.create();
    for (const file of files) {
        const imageBytes = await file.arrayBuffer();
        const image = file.type === 'image/png'
            ? await pdfDoc.embedPng(imageBytes)
            : await pdfDoc.embedJpg(imageBytes);
        
        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
            x: 0,
            y: 0,
            width: image.width,
            height: image.height,
        });
    }
    return pdfDoc.save();
};

// --- Image Service ---

export const compressImage = (file: File, quality: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

export const resizeImage = (file: File, width: number, height: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL(file.type);
        resolve(dataUrl);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};


export const convertImage = (file: File, targetFormat: 'image/jpeg' | 'image/png'): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if(!ctx) return reject('Could not get canvas context');
                
                if (targetFormat === 'image/jpeg') {
                    // Fill background with white for transparency
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
                
                ctx.drawImage(img, 0, 0);
                const dataUrl = canvas.toDataURL(targetFormat);
                resolve(dataUrl);
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
};
