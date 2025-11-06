
export interface Transaction {
  date: string;
  description: string;
  amount: number;
  category: string;
  notes: string;
}

export interface GenerativePart {
  inlineData: {
    mimeType: string;
    data: string;
  };
}
