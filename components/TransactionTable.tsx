import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';

interface TransactionTableProps {
  transactions: Transaction[];
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions }) => {
  const [copied, setCopied] = useState(false);

  const summary = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalSpending = transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalSpending,
      totalTransactions: transactions.length,
    };
  }, [transactions]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
      amount
    );


  const copyToClipboard = () => {
    const headers = ['Date', 'Description', 'Amount', 'Category', 'Notes'];
    
    // Helper to clean data for TSV (Tab-Separated Values) format, which is robust for pasting into sheets.
    const sanitizeCell = (text: string | undefined | null): string => {
        if (text === null || typeof text === 'undefined') {
            return '';
        }
        // Replace tabs and newlines with a space to prevent breaking the table structure.
        return String(text).replace(/[\t\n\r]/g, ' ');
    };

    const tsvContent = [
      headers.join('\t'),
      ...transactions.map(t => [
        sanitizeCell(t.date),
        sanitizeCell(t.description),
        t.amount, // Numbers don't need sanitization for this purpose
        sanitizeCell(t.category),
        sanitizeCell(t.notes)
      ].join('\t'))
    ].join('\n');
    
    navigator.clipboard.writeText(tsvContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="w-full space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-200">
                <p className="text-sm text-blue-600 font-medium">Total Transactions</p>
                <p className="text-2xl font-bold text-blue-800">{summary.totalTransactions}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center border border-green-200">
                <p className="text-sm text-green-600 font-medium">Total Income</p>
                <p className="text-2xl font-bold text-green-800">{formatCurrency(summary.totalIncome)}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center border border-red-200">
                <p className="text-sm text-red-600 font-medium">Total Spending</p>
                <p className="text-2xl font-bold text-red-800">{formatCurrency(Math.abs(summary.totalSpending))}</p>
            </div>
        </div>

        {/* Transaction List */}
        <div>
            <div className="flex justify-end items-center mb-2">
                <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1.5 px-3 rounded-md transition-colors"
                >
                    {copied ? <CheckIcon/> : <CopyIcon/>}
                    {copied ? 'Copied!' : 'Copy for Sheets'}
                </button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200 max-h-80">
                <table className="min-w-full divide-y divide-gray-200 bg-white">
                <thead className="bg-gray-50 sticky top-0">
                    <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {transactions.map((t, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{t.date}</td>
                        <td className="px-4 py-3 text-sm text-gray-800">{t.description}</td>
                        <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${t.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(t.amount)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                {t.category}
                            </span>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default TransactionTable;