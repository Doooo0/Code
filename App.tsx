
import React, { useState, useCallback } from 'react';
import { Transaction } from './types';
import { analyzeStatement } from './services/geminiService';
import { fileToGenerativePart } from './utils/fileUtils';
import FileUpload from './components/FileUpload';
import TransactionTable from './components/TransactionTable';
import { UploadIcon } from './components/icons/UploadIcon';

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileSelect = (files: File[]) => {
    setSelectedFiles(files);
    setTransactions([]);
    setError(null);
  };

  const handleProcessStatement = useCallback(async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one file.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setTransactions([]);

    try {
      const allPartsPromises = selectedFiles.map(file => fileToGenerativePart(file));
      const partsArrays = await Promise.all(allPartsPromises);
      const combinedParts = partsArrays.flat();

      if (combinedParts.length === 0) {
        throw new Error("Could not extract any processable content from the uploaded files.");
      }

      const result = await analyzeStatement(combinedParts);
      
      // Clean the response from markdown and parse
      let jsonString = result.replace(/```json/g, '').replace(/```/g, '').trim();
      
      try {
        const parsedTransactions = JSON.parse(jsonString);
        if (Array.isArray(parsedTransactions)) {
           setTransactions(parsedTransactions);
        } else {
           setError("The AI response was not in the expected format (an array of transactions).");
        }
      } catch (parseError) {
        console.error('JSON parsing error:', parseError, 'Raw response:', jsonString);
        setError('Failed to parse the transaction data from the AI. Please try again.');
      }

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedFiles]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-primary-700">Bank Statement OCR</h1>
          <p className="mt-2 text-lg text-gray-600">
            Upload bank statements (PDF/Image) to extract transactions using Gemini.
          </p>
        </header>

        <main className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="flex flex-col space-y-4">
              <h2 className="text-2xl font-semibold text-gray-700">1. Upload Statements</h2>
              <FileUpload onFileSelect={handleFileSelect} isProcessing={isProcessing} />
               <button
                onClick={handleProcessStatement}
                disabled={selectedFiles.length === 0 || isProcessing}
                className="w-full flex justify-center items-center gap-2 bg-primary-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                {isProcessing ? (
                   <>
                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                     Processing...
                   </>
                ) : (
                   <>
                    <UploadIcon />
                    Analyze Statements
                   </>
                )}
              </button>
            </div>
            
            <div className="flex flex-col space-y-4 mt-8 md:mt-0">
               <h2 className="text-2xl font-semibold text-gray-700">2. Extracted Data</h2>
               <div className="bg-gray-50 rounded-lg p-4 min-h-[200px] border border-gray-200">
                {error && <div className="text-red-600 bg-red-100 p-3 rounded-md">{error}</div>}
                 {!isProcessing && !error && transactions.length === 0 && (
                   <div className="text-center text-gray-500 py-10">
                     <p>Your extracted transactions will appear here.</p>
                   </div>
                 )}
                 {transactions.length > 0 && <TransactionTable transactions={transactions} />}
               </div>
            </div>
          </div>
        </main>

        <footer className="text-center mt-8 text-gray-500 text-sm">
          <p>Powered by Google Gemini. App designed for demonstration purposes.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
