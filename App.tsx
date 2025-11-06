
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    setTransactions([]);
    setError(null);
  };

  const handleProcessStatement = useCallback(async () => {
    if (!selectedFile) {
      setError('Please select a file first.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setTransactions([]);

    try {
      const parts = await fileToGenerativePart(selectedFile);
      const result = await analyzeStatement(parts);
      
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
  }, [selectedFile]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-primary-700">Bank Statement OCR</h1>
          <p className="mt-2 text-lg text-gray-600">
            Upload a bank statement (PDF/Image) to extract transactions using Gemini.
          </p>
        </header>

        <main className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="flex flex-col space-y-4">
              <h2 className="text-2xl font-semibold text-gray-700">1. Upload Statement</h2>
              <FileUpload onFileSelect={handleFileSelect} isProcessing={isProcessing} />
               <button
                onClick={handleProcessStatement}
                disabled={!selectedFile || isProcessing}
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
                    Analyze Statement
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
