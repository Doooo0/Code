
import React, { useState } from 'react';
import { Transaction } from '../types';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';

interface TransactionTableProps {
  transactions: Transaction[];
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const headers = ['Date', 'Description', 'Amount', 'Category', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(t => [
        `"${t.date}"`,
        `"${t.description.replace(/"/g, '""')}"`, // Escape double quotes
        t.amount,
        `"${t.category}"`,
        `"${t.notes ? t.notes.replace(/"/g, '""') : ''}"`
      ].join(','))
    ].join('\n');
    
    navigator.clipboard.writeText(csvContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="w-full">
        <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium text-gray-700">Found {transactions.length} transactions</h3>
             <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1.5 px-3 rounded-md transition-colors"
            >
                {copied ? <CheckIcon/> : <CopyIcon/>}
                {copied ? 'Copied!' : 'Copy CSV'}
            </button>
        </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200 max-h-96">
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
  );
};

export default TransactionTable;
