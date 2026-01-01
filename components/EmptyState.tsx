import React from 'react';
import { Ghost } from 'lucide-react';

export const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center h-64 text-textSec opacity-50">
    <Ghost size={48} className="mb-4" />
    <p className="text-sm font-medium">{message}</p>
  </div>
);
