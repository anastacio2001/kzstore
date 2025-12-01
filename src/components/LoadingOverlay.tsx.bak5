import { Loader2 } from 'lucide-react';

type LoadingOverlayProps = {
  message?: string;
};

export function LoadingOverlay({ message = 'Carregando...' }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
      <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4">
        <Loader2 className="size-12 text-[#E31E24] animate-spin" />
        <p className="text-gray-700">{message}</p>
      </div>
    </div>
  );
}
