import { Home, ChevronRight } from 'lucide-react';

type BreadcrumbItem = {
  label: string;
  href?: string;
  onClick?: () => void;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6 overflow-x-auto">
      {/* Home */}
      <button
        onClick={() => window.location.href = '/'}
        className="flex items-center gap-1 hover:text-[#E31E24] transition-colors flex-shrink-0"
      >
        <Home className="size-4" />
        <span>Home</span>
      </button>

      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2 flex-shrink-0">
          <ChevronRight className="size-4 text-gray-400" />
          {item.onClick || item.href ? (
            <button
              onClick={item.onClick || (() => window.location.href = item.href!)}
              className={`hover:text-[#E31E24] transition-colors ${
                index === items.length - 1 ? 'text-[#E31E24] font-medium' : ''
              }`}
            >
              {item.label}
            </button>
          ) : (
            <span className="text-[#E31E24] font-medium truncate max-w-[200px]">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
