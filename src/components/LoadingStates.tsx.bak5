// Product Card Skeleton
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-square bg-gray-200 shimmer" />
      
      {/* Content Skeleton */}
      <div className="p-5 space-y-3">
        {/* Category Badge */}
        <div className="h-6 w-24 bg-gray-200 rounded-lg shimmer" />
        
        {/* Title */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded shimmer" />
          <div className="h-4 w-3/4 bg-gray-200 rounded shimmer" />
        </div>
        
        {/* Description */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-100 rounded shimmer" />
          <div className="h-3 w-5/6 bg-gray-100 rounded shimmer" />
        </div>
        
        {/* Price & Button */}
        <div className="flex items-end justify-between pt-4">
          <div className="space-y-2">
            <div className="h-3 w-20 bg-gray-100 rounded shimmer" />
            <div className="h-6 w-32 bg-gray-200 rounded shimmer" />
          </div>
          <div className="size-12 bg-gray-200 rounded-xl shimmer" />
        </div>
      </div>
    </div>
  );
}

// Product Grid Skeleton
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

// Product Detail Skeleton
export function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Skeleton */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-200 rounded-2xl shimmer" />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-xl shimmer" />
            ))}
          </div>
        </div>

        {/* Details Skeleton */}
        <div className="space-y-6">
          <div className="h-8 w-32 bg-gray-200 rounded-lg shimmer" />
          <div className="space-y-3">
            <div className="h-10 bg-gray-200 rounded shimmer" />
            <div className="h-10 w-3/4 bg-gray-200 rounded shimmer" />
          </div>
          <div className="h-32 bg-gray-100 rounded-2xl shimmer" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-100 rounded shimmer" />
            <div className="h-4 bg-gray-100 rounded shimmer" />
            <div className="h-4 w-5/6 bg-gray-100 rounded shimmer" />
          </div>
          <div className="flex gap-4">
            <div className="flex-1 h-14 bg-gray-200 rounded-xl shimmer" />
            <div className="flex-1 h-14 bg-gray-200 rounded-xl shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Cart Item Skeleton
export function CartItemSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 animate-pulse">
      <div className="flex gap-6">
        <div className="w-32 h-32 bg-gray-200 rounded-xl shimmer" />
        <div className="flex-1 space-y-3">
          <div className="h-6 w-24 bg-gray-200 rounded shimmer" />
          <div className="h-5 bg-gray-200 rounded shimmer" />
          <div className="h-4 w-3/4 bg-gray-100 rounded shimmer" />
          <div className="flex items-center justify-between">
            <div className="h-10 w-32 bg-gray-200 rounded-xl shimmer" />
            <div className="h-6 w-32 bg-gray-200 rounded shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Admin Table Row Skeleton
export function TableRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded shimmer w-20" />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-gray-200 rounded-lg shimmer" />
          <div className="h-4 bg-gray-200 rounded shimmer w-40" />
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded shimmer w-24" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded shimmer w-28" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded shimmer w-16" />
      </td>
      <td className="px-6 py-4">
        <div className="flex gap-2">
          <div className="size-8 bg-gray-200 rounded-lg shimmer" />
          <div className="size-8 bg-gray-200 rounded-lg shimmer" />
        </div>
      </td>
    </tr>
  );
}

// Dashboard Stats Skeleton
export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-2xl p-6 border-2 border-gray-100 animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-2 flex-1">
              <div className="h-4 w-24 bg-gray-200 rounded shimmer" />
              <div className="h-8 w-32 bg-gray-200 rounded shimmer" />
            </div>
            <div className="size-12 bg-gray-200 rounded-xl shimmer" />
          </div>
          <div className="h-3 w-20 bg-gray-100 rounded shimmer" />
        </div>
      ))}
    </div>
  );
}

// Full Page Loading
export function PageLoading({ message = 'Carregando...' }: { message?: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="inline-flex items-center justify-center size-20 rounded-full bg-red-100 text-red-600 mb-6 animate-pulse">
          <svg className="size-10 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{message}</h3>
        <p className="text-gray-600">Por favor, aguarde...</p>
      </div>
    </div>
  );
}

// Inline Spinner
export function Spinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg', className?: string }) {
  const sizeClasses = {
    sm: 'size-4',
    md: 'size-6',
    lg: 'size-8'
  };

  return (
    <svg 
      className={`${sizeClasses[size]} animate-spin ${className}`} 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4" 
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
      />
    </svg>
  );
}

// Empty State
export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel,
  onAction 
}: { 
  icon: any;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="text-center py-16 px-4 animate-fade-in">
      <div className="inline-flex items-center justify-center size-20 rounded-full bg-gray-100 text-gray-400 mb-6">
        <Icon className="size-10" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// Error State
export function ErrorState({ 
  title = 'Algo deu errado',
  description = 'Ocorreu um erro ao carregar os dados. Por favor, tente novamente.',
  onRetry
}: { 
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="text-center py-16 px-4 animate-fade-in">
      <div className="inline-flex items-center justify-center size-20 rounded-full bg-red-100 text-red-600 mb-6">
        <svg className="size-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold"
        >
          <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Tentar Novamente
        </button>
      )}
    </div>
  );
}
