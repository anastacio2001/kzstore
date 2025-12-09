import React from 'react';
import { Button } from './ui/button';
import { Repeat } from 'lucide-react';

interface TradeInButtonProps {
  onNavigate: (page: string) => void;
  variant?: 'default' | 'outline';
  className?: string;
}

export default function TradeInButton({ onNavigate, variant = 'outline', className = '' }: TradeInButtonProps) {
  return (
    <Button 
      variant={variant}
      className={`border-green-600 text-green-600 hover:bg-green-50 hover:border-green-700 transition-all shadow-sm ${className}`}
      onClick={() => onNavigate('trade-in')}
    >
      <Repeat className="h-4 w-4 mr-2" />
      Trade-In (Troca)
    </Button>
  );
}
