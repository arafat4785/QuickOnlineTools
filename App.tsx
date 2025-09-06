
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import type { Tool, UnitCategory, Unit } from './types';
import { ToolCategory } from './types';
import { TOOLS, UNIT_CATEGORIES } from './constants';
import * as Services from './services';

// --- Reusable Components ---

const Loader = ({ text = 'Processing...' }: { text?: string }) => (
  <div className="flex flex-col items-center justify-center space-y-2 p-4">
    <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p className="text-slate-500 dark:text-slate-400">{text}</p>
  </div>
);

const FileDropzone = ({ onFiles, accept, multiple = false, text = "Drag 'n' drop some files here, or click to select files" }: { onFiles: (files: File[]) => void, accept: string, multiple?: boolean, text?: string }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFiles(Array.from(e.dataTransfer.files));
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        onFiles(Array.from(e.target.files));
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors duration-200 ease-in-out
      ${isDragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-primary-400'}`}
    >
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} className="hidden" onChange={handleChange} />
      <p className="text-slate-500 dark:text-slate-400">{text}</p>
    </div>
  );
};

const ToolCard = ({ tool }: { tool: Tool }) => (
  <Link to={`/tool/${tool.id}`} className="block p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
    <div className="flex items-center space-x-4">
      <div className="flex-shrink-0 bg-primary-100 dark:bg-primary-900/50 p-3 rounded-full">
        <tool.icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{tool.name}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">{tool.description}</p>
      </div>
    </div>
  </Link>
);

const ResultDisplay = ({ title, children, actions }: { title: string, children: React.ReactNode, actions: React.ReactNode }) => (
  <div className="mt-6 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-inner">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="flex space-x-2">
        {actions}
      </div>
    </div>
    <div className="max-h-96 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-900/70 rounded">
        {children}
    </div>
  </div>
);

const Button = ({ onClick, children, className = '' }: { onClick?: () => void, children: React.ReactNode, className?: string }) => (
    <button onClick={onClick} className={`px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}>
        {children}
    </button>
);

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return <Button onClick={handleCopy}>{copied ? 'Copied!' : 'Copy'}</Button>;
};


// --- Layout Components ---

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40 shadow-sm">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <svg className="h-8 w-8 text-primary-600" viewBox="0 0 24 24" fill="currentColor"><path d="M7 7.5A2.5 2.5 0 0 1 9.5 5h5A2.5 2.5 0 0 1 17 7.5v5A2.5 2.5 0 0 1 14.5 15h-5A2.5 2.5 0 0 1 7 12.5v-5zM9.5 6.5a1.5 1.5 0 0 0-1.5 1.5v5a1.5 1.5 0 0 0 1.5 1.5h5a1.5 1.5 0 0 0 1.5-1.5v-5a1.5 1.5 0 0 0-1.5-1.5h-5zM17 17.5a2.5 2.5 0 0 1-2.5 2.5h-5A2.5 2.5 0 0 1 7 17.5V17h1.5a1 1 0 0 0 1-1V14.5a1 1 0 0 0-1-1H7v-1.5a1 1 0 0 0-1-1H4.5a1 1 0 0 0-1 1V17.5A4.5 4.5 0 0 0 8 22h5.5a4.5 4.5 0 0 0 4.5-4.5V16h-1.5a1 1 0 0 0-1 1V17.5z"/></svg>
            <span className="text-xl font-bold text-slate-800 dark:text-slate-200">AI Toolbox</span>
          </Link>
          <div className="hidden md:flex space-x-6">
            {Object.values(ToolCategory).map(cat => <Link key={cat} to={`/category/${cat}`} className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">{cat}</Link>)}
          </div>
          <div className="md:hidden">
            <button onClick={() => setMenuOpen(!menuOpen)}>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} /></svg>
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden py-4">
             {Object.values(ToolCategory).map(cat => <Link key={cat} to={`/category/${cat}`} onClick={() => setMenuOpen(false)} className="block py-2 px-4 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">{cat}</Link>)}
          </div>
        )}
      </nav>
    </header>
  );
};

const Footer = () => (
  <footer className="bg-white dark:bg-slate-800/50 mt-16 border-t border-slate-200 dark:border-slate-700">
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500 dark:text-slate-400">
      <p>&copy; {new Date().getFullYear()} AI Toolbox. All rights reserved.</p>
      <p className="mt-2">This is a project created for demonstration purposes. Files are processed client-side and never uploaded to a server.</p>
    </div>
  </footer>
);

// --- Tool Implementations ---

// Abstracted logic for many tools
const useFileProcessor = <T,>(
  processor: (files: File[], ...args: any[]) => Promise<T>, 
  formatter: (result: T) => { data: any, filename: string, mimeType?: string }
) => {
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState<ReturnType<typeof formatter> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const processFiles = async (...args: any[]) => {
    if (files.length === 0) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const processedResult = await processor(files, ...args);
      setResult(formatter(processedResult));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFiles([]);
    setResult(null);
    setError('');
  };

  return { files, setFiles, result, loading, error, processFiles, reset };
};

const ImageToText = () => {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleFile = (files: File[]) => {
    if (files[0]) {
      setFile(files[0]);
      setText('');
      setError('');
    }
  };

  const extractText = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const base64 = await Services.fileToBase64(file);
      const extractedText = await Services.geminiImageToText(base64, file.type);
      setText(extractedText);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract text.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FileDropzone onFiles={handleFile} accept="image/*" />
      {file && (
        <div className="mt-4 text-center">
          <p>Selected: {file.name}</p>
          <Button onClick={extractText} className="mt-2" >Extract Text</Button>
        </div>
      )}
      {loading && <Loader text="Analyzing Image..." />}
      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
      {text && (
        <ResultDisplay title="Extracted Text" actions={<CopyButton text={text} />}>
            <pre className="whitespace-pre-wrap font-sans">{text}</pre>
        </ResultDisplay>
      )}
    </>
  );
};

const TextToImage = () => {
    const [prompt, setPrompt] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const generateImage = async () => {
        if (!prompt) return;
        setLoading(true);
        setError('');
        setImage(null);
        try {
            const base64Image = await Services.geminiTextToImage(prompt);
            setImage(`data:image/png;base64,${base64Image}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate image.');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div>
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A majestic lion wearing a crown, cinematic lighting"
                className="w-full p-2 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600 focus:ring-primary-500 focus:border-primary-500"
                rows={4}
            />
            <Button onClick={generateImage} className="mt-4 w-full">Generate Image</Button>
            {loading && <Loader text="Generating Image..." />}
            {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
            {image && (
                 <ResultDisplay title="Generated Image" actions={<a href={image} download="generated-image.png"><Button>Download</Button></a>}>
                    <img src={image} alt={prompt} className="rounded-md mx-auto" />
                </ResultDisplay>
            )}
        </div>
    );
};

const AiWriter = ({ service, fields, buttonText, loaderText }: { service: (...args: string[]) => Promise<string>, fields: {id: string, label: string, placeholder: string, type?: 'input' | 'textarea'}[], buttonText: string, loaderText: string }) => {
    const [formState, setFormState] = useState<{[key: string]: string}>(() => fields.reduce((acc, f) => ({...acc, [f.id]: ''}), {}));
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormState({...formState, [e.target.name]: e.target.value});
    };
    
    const generate = async () => {
        setLoading(true);
        setError('');
        setResult('');
        try {
            const args = fields.map(f => formState[f.id]);
            const res = await service(...args);
            setResult(res);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {fields.map(field => (
                <div key={field.id}>
                    <label htmlFor={field.id} className="block text-sm font-medium text-slate-700 dark:text-slate-300">{field.label}</label>
                    {field.type === 'textarea' ? (
                        <textarea id={field.id} name={field.id} value={formState[field.id]} onChange={handleChange} placeholder={field.placeholder} rows={3} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600 sm:text-sm"/>
                    ) : (
                        <input type="text" id={field.id} name={field.id} value={formState[field.id]} onChange={handleChange} placeholder={field.placeholder} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600 sm:text-sm"/>
                    )}
                </div>
            ))}
            <Button onClick={generate} className="w-full">{buttonText}</Button>
            {loading && <Loader text={loaderText} />}
            {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
            {result && (
                <ResultDisplay title="Generated Content" actions={<CopyButton text={result} />}>
                    <pre className="whitespace-pre-wrap font-sans text-sm">{result}</pre>
                </ResultDisplay>
            )}
        </div>
    );
}

const FlyerMaker = () => {
    const fields = [
        { id: 'title', label: 'Event Title', placeholder: 'e.g., Summer Music Festival' },
        { id: 'date', label: 'Date & Time', placeholder: 'e.g., Saturday, August 10th @ 2 PM' },
        { id: 'location', label: 'Location', placeholder: 'e.g., Central Park, Main Stage' },
        { id: 'description', label: 'Description/Details', placeholder: 'e.g., Featuring local bands, food trucks, and more!', type: 'textarea' as const },
    ];
    return <AiWriter service={Services.geminiFlyerMaker} fields={fields} buttonText="Generate Flyer" loaderText="Designing your flyer..." />;
};

const ImageCompressor = () => {
    const [quality, setQuality] = useState(0.7);
    const { files, setFiles, result, loading, error, processFiles, reset } = useFileProcessor(
        (files, quality) => Services.compressImage(files[0], quality),
        (dataUrl) => ({ data: dataUrl, filename: 'compressed-image.jpg', mimeType: 'image/jpeg' })
    );

    return (
        <>
            <FileDropzone onFiles={setFiles} accept="image/*" />
            {files.length > 0 && (
                <div className="mt-4 text-center space-y-4">
                    <p>Selected: {files[0].name}</p>
                    <div>
                        <label htmlFor="quality" className="block text-sm font-medium">Quality: {Math.round(quality * 100)}%</label>
                        <input type="range" id="quality" min="0.1" max="1.0" step="0.05" value={quality} onChange={e => setQuality(parseFloat(e.target.value))} className="w-64 accent-primary-600" />
                    </div>
                    <Button onClick={() => processFiles(quality)}>Compress Image</Button>
                    <Button onClick={reset} className="ml-2 bg-slate-500 hover:bg-slate-600">Clear</Button>
                </div>
            )}
            {loading && <Loader />}
            {error && <p className="text-red-500 mt-4">{error}</p>}
            {result && (
                <ResultDisplay title="Compressed Image" actions={<a href={result.data} download={result.filename}><Button>Download</Button></a>}>
                    <img src={result.data} alt="Compressed" className="max-w-full h-auto rounded-md" />
                </ResultDisplay>
            )}
        </>
    );
};

const ImageResizer = () => {
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const { files, setFiles, result, loading, error, processFiles, reset } = useFileProcessor(
        (files, w, h) => Services.resizeImage(files[0], w, h),
        (dataUrl) => ({ data: dataUrl, filename: 'resized-image.png', mimeType: 'image/png' })
    );

    const handleFileChange = (selectedFiles: File[]) => {
      if (selectedFiles[0]) {
        const img = new Image();
        img.src = URL.createObjectURL(selectedFiles[0]);
        img.onload = () => {
          setDimensions({ width: img.width, height: img.height });
          URL.revokeObjectURL(img.src);
        };
      }
      setFiles(selectedFiles);
    };

    return (
        <>
            <FileDropzone onFiles={handleFileChange} accept="image/*" />
            {files.length > 0 && (
                <div className="mt-4 text-center space-y-4">
                    <p>Selected: {files[0].name}</p>
                    <div className="flex justify-center items-center space-x-4">
                        <input type="number" value={dimensions.width} onChange={e => setDimensions(d => ({...d, width: parseInt(e.target.value)}))} className="w-24 p-1 border rounded dark:bg-slate-700"/>
                        <span>x</span>
                        <input type="number" value={dimensions.height} onChange={e => setDimensions(d => ({...d, height: parseInt(e.target.value)}))} className="w-24 p-1 border rounded dark:bg-slate-700"/>
                    </div>
                    <Button onClick={() => processFiles(dimensions.width, dimensions.height)}>Resize Image</Button>
                    <Button onClick={reset} className="ml-2 bg-slate-500 hover:bg-slate-600">Clear</Button>
                </div>
            )}
            {loading && <Loader />}
            {error && <p className="text-red-500 mt-4">{error}</p>}
            {result && (
                <ResultDisplay title="Resized Image" actions={<a href={result.data} download={result.filename}><Button>Download</Button></a>}>
                    <img src={result.data} alt="Resized" className="max-w-full h-auto rounded-md" />
                </ResultDisplay>
            )}
        </>
    );
};

const ImageConverter = () => {
    const [format, setFormat] = useState<'image/jpeg' | 'image/png'>('image/jpeg');
    const { files, setFiles, result, loading, error, processFiles, reset } = useFileProcessor(
        (files, fmt) => Services.convertImage(files[0], fmt),
        (dataUrl) => {
          const extension = format === 'image/jpeg' ? 'jpg' : 'png';
          return { data: dataUrl, filename: `converted-image.${extension}`, mimeType: format };
        }
    );
    
    return (
        <>
            <FileDropzone onFiles={setFiles} accept="image/*" />
            {files.length > 0 && (
                <div className="mt-4 text-center space-y-4">
                    <p>Selected: {files[0].name}</p>
                    <select value={format} onChange={e => setFormat(e.target.value as any)} className="p-2 border rounded dark:bg-slate-700">
                        <option value="image/jpeg">to JPG</option>
                        <option value="image/png">to PNG</option>
                    </select>
                    <Button onClick={() => processFiles(format)} className="ml-2">Convert</Button>
                    <Button onClick={reset} className="ml-2 bg-slate-500 hover:bg-slate-600">Clear</Button>
                </div>
            )}
            {loading && <Loader />}
            {error && <p className="text-red-500 mt-4">{error}</p>}
            {result && (
                <ResultDisplay title="Converted Image" actions={<a href={result.data} download={result.filename}><Button>Download</Button></a>}>
                    <img src={result.data} alt="Converted" className="max-w-full h-auto rounded-md" />
                </ResultDisplay>
            )}
        </>
    );
};

const MergePdf = () => {
    const { files, setFiles, result, loading, error, processFiles, reset } = useFileProcessor(
        Services.mergePdfs,
        (pdfBytes) => ({ data: pdfBytes, filename: 'merged.pdf', mimeType: 'application/pdf' })
    );

    return (
        <>
            <FileDropzone onFiles={setFiles} accept=".pdf" multiple />
            {files.length > 0 && (
                <div className="mt-4">
                    <h4 className="font-semibold text-center">Selected Files:</h4>
                    <ul className="list-disc list-inside text-center">
                        {files.map(f => <li key={f.name}>{f.name}</li>)}
                    </ul>
                    <div className="text-center mt-4">
                      <Button onClick={() => processFiles()}>Merge PDFs</Button>
                      <Button onClick={reset} className="ml-2 bg-slate-500 hover:bg-slate-600">Clear</Button>
                    </div>
                </div>
            )}
            {loading && <Loader text="Merging PDFs..."/>}
            {error && <p className="text-red-500 mt-4">{error}</p>}
            {result && (
                <div className="mt-6 text-center">
                    <p className="font-semibold text-green-600">PDFs merged successfully!</p>
                    <Button onClick={() => Services.downloadFile(result.data, result.filename, result.mimeType)} className="mt-2">Download Merged PDF</Button>
                </div>
            )}
        </>
    );
};

const ImageToPdf = () => {
    const { files, setFiles, result, loading, error, processFiles, reset } = useFileProcessor(
        Services.imageToPdf,
        (pdfBytes) => ({ data: pdfBytes, filename: 'converted.pdf', mimeType: 'application/pdf' })
    );

    return (
        <>
            <FileDropzone onFiles={setFiles} accept="image/jpeg,image/png" multiple text="Drop JPG or PNG files here"/>
            {files.length > 0 && (
                <div className="mt-4">
                    <h4 className="font-semibold text-center">Selected Files:</h4>
                    <ul className="list-disc list-inside text-center">
                        {files.map(f => <li key={f.name}>{f.name}</li>)}
                    </ul>
                    <div className="text-center mt-4">
                      <Button onClick={() => processFiles()}>Convert to PDF</Button>
                      <Button onClick={reset} className="ml-2 bg-slate-500 hover:bg-slate-600">Clear</Button>
                    </div>
                </div>
            )}
            {loading && <Loader text="Converting to PDF..."/>}
            {error && <p className="text-red-500 mt-4">{error}</p>}
            {result && (
                <div className="mt-6 text-center">
                    <p className="font-semibold text-green-600">Conversion successful!</p>
                    <Button onClick={() => Services.downloadFile(result.data, result.filename, result.mimeType)} className="mt-2">Download PDF</Button>
                </div>
            )}
        </>
    );
};

const PdfToJpg = () => (
    <div className="text-center p-8 bg-slate-100 dark:bg-slate-800 rounded-lg">
        <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-300">Coming Soon!</h3>
        <p className="mt-2 text-slate-500 dark:text-slate-400">This feature is under development. Please check back later.</p>
    </div>
);

const UnitConverter = () => {
  const [category, setCategory] = useState(UNIT_CATEGORIES[0]);
  const [fromUnit, setFromUnit] = useState(category.units[0]);
  const [toUnit, setToUnit] = useState(category.units[1]);
  const [inputValue, setInputValue] = useState('1');
  const [outputValue, setOutputValue] = useState('');

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = UNIT_CATEGORIES.find(c => c.name === e.target.value)!;
    setCategory(newCategory);
    setFromUnit(newCategory.units[0]);
    setToUnit(newCategory.units[1] || newCategory.units[0]);
    setInputValue('1');
  };

  const convert = useCallback(() => {
    const value = parseFloat(inputValue);
    if (isNaN(value)) {
      setOutputValue('');
      return;
    }

    let result;
    if (category.name === "Temperature") {
      if (fromUnit.name === "Celsius") {
        if (toUnit.name === "Fahrenheit") result = value * 1.8 + 32;
        else if (toUnit.name === "Kelvin") result = value + 273.15;
        else result = value;
      } else if (fromUnit.name === "Fahrenheit") {
        if (toUnit.name === "Celsius") result = (value - 32) / 1.8;
        else if (toUnit.name === "Kelvin") result = (value - 32) / 1.8 + 273.15;
        else result = value;
      } else { // Kelvin
        if (toUnit.name === "Celsius") result = value - 273.15;
        else if (toUnit.name === "Fahrenheit") result = (value - 273.15) * 1.8 + 32;
        else result = value;
      }
    } else {
      result = (value * fromUnit.factor) / toUnit.factor;
    }
    setOutputValue(result.toLocaleString(undefined, { maximumFractionDigits: 5 }));
  }, [inputValue, fromUnit, toUnit, category]);

  useEffect(() => {
    convert();
  }, [convert]);

  return (
    <div className="space-y-4">
        <select onChange={handleCategoryChange} value={category.name} className="w-full p-2 border rounded dark:bg-slate-700">
            {UNIT_CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>
        <div className="flex items-center space-x-2">
            <div className="w-1/2">
                <input type="number" value={inputValue} onChange={e => setInputValue(e.target.value)} className="w-full p-2 border rounded dark:bg-slate-700"/>
                <select value={fromUnit.name} onChange={e => setFromUnit(category.units.find(u => u.name === e.target.value)!)} className="w-full p-2 mt-1 border rounded dark:bg-slate-700">
                    {category.units.map(u => <option key={u.name} value={u.name}>{u.name} ({u.symbol})</option>)}
                </select>
            </div>
            <div className="w-1/2">
                <input type="text" value={outputValue} readOnly className="w-full p-2 border rounded bg-slate-100 dark:bg-slate-800"/>
                <select value={toUnit.name} onChange={e => setToUnit(category.units.find(u => u.name === e.target.value)!)} className="w-full p-2 mt-1 border rounded dark:bg-slate-700">
                    {category.units.map(u => <option key={u.name} value={u.name}>{u.name} ({u.symbol})</option>)}
                </select>
            </div>
        </div>
    </div>
  );
};


// --- Pages ---

const HomePage = () => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const foundTool = TOOLS.find(tool => tool.name.toLowerCase().includes(search.toLowerCase()));
    if (foundTool) {
      navigate(`/tool/${foundTool.id}`);
    }
  };

  const filteredTools = useMemo(() => {
    if (!search) return TOOLS;
    return TOOLS.filter(tool =>
      tool.name.toLowerCase().includes(search.toLowerCase()) ||
      tool.description.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const groupedTools = useMemo(() => {
    return filteredTools.reduce((acc, tool) => {
      (acc[tool.category] = acc[tool.category] || []).push(tool);
      return acc;
    }, {} as Record<ToolCategory, Tool[]>);
  }, [filteredTools]);
  
  const featuredTools = TOOLS.filter(t => t.featured);

  return (
    <div className="space-y-16">
      <section className="text-center py-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
          All-in-One AI & File Tools
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
          Free, Fast & Secure tools to boost your productivity. Convert files, generate content, and edit images right in your browser.
        </p>
        <form onSubmit={handleSearch} className="mt-8 max-w-xl mx-auto">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for a tool (e.g., 'PDF Merge')"
            className="w-full p-4 rounded-full border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-primary-500 focus:outline-none dark:bg-slate-800"
          />
        </form>
      </section>

      {search === '' && (
          <section>
              <h2 className="text-2xl font-bold text-center mb-8">Featured Tools</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredTools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
              </div>
          </section>
      )}

      {Object.entries(groupedTools).map(([category, tools]) => (
        <section key={category}>
          <h2 className="text-2xl font-bold mb-6">{category}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
          </div>
        </section>
      ))}
    </div>
  );
};

const ToolListPage = () => {
    const { category } = useParams<{ category: ToolCategory }>();
    const tools = TOOLS.filter(t => t.category === category);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">{category}</h1>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
            </div>
        </div>
    );
};

const ToolPage = () => {
    const { toolId } = useParams<{ toolId: string }>();
    const tool = useMemo(() => TOOLS.find(t => t.id === toolId), [toolId]);

    const renderTool = () => {
        switch (toolId) {
            case 'image-to-text': return <ImageToText />;
            case 'text-to-image': return <TextToImage />;
            case 'blog-writer': return <AiWriter service={Services.geminiBlogWriter} fields={[{ id: 'topic', label: 'Blog Topic', placeholder: 'e.g., The Future of Renewable Energy' }, { id: 'keywords', label: 'Keywords (comma-separated)', placeholder: 'e.g., solar, wind, sustainability' }]} buttonText="Write Blog Post" loaderText="Writing your blog..." />;
            case 'email-writer': return <AiWriter service={Services.geminiEmailWriter} fields={[{ id: 'recipient', label: 'Recipient', placeholder: "e.g., My Manager" }, { id: 'subject', label: 'Subject', placeholder: 'e.g., Project Update' }, { id: 'intent', label: 'What is the email about?', placeholder: 'e.g., Ask for an extension on the report deadline by 2 days.', type: 'textarea' }]} buttonText="Write Email" loaderText="Composing your email..." />;
            case 'flyer-maker': return <FlyerMaker />;
            case 'image-compressor': return <ImageCompressor />;
            case 'image-resizer': return <ImageResizer />;
            case 'image-converter': return <ImageConverter />;
            case 'merge-pdf': return <MergePdf />;
            case 'image-to-pdf': return <ImageToPdf />;
            case 'pdf-to-jpg': return <PdfToJpg />;
            case 'unit-converter': return <UnitConverter />;
            default: return <p>Tool not found.</p>;
        }
    };

    if (!tool) {
        return <p>Tool not found.</p>;
    }

    return (
        <div>
            <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center bg-primary-100 dark:bg-primary-900/50 p-4 rounded-full mb-4">
                    <tool.icon className="h-10 w-10 text-primary-600 dark:text-primary-400" />
                </div>
                <h1 className="text-3xl font-bold">{tool.name}</h1>
                <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">{tool.description}</p>
            </div>
            <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg">
                {renderTool()}
            </div>
        </div>
    );
};


// --- App Component ---

export default function App() {
  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/category/:category" element={<ToolListPage />} />
            <Route path="/tool/:toolId" element={<ToolPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
}
