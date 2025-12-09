import { useEffect, useState } from 'react';

type ReadingProgressProps = {
  target?: React.RefObject<HTMLElement>;
};

export function ReadingProgress({ target }: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (target?.current) {
        const element = target.current;
        const elementTop = element.offsetTop;
        const elementHeight = element.offsetHeight;
        const scrollTop = window.scrollY;
        const windowHeight = window.innerHeight;
        
        // Calculate how much of the element has been scrolled past
        const scrolled = Math.max(0, scrollTop - elementTop + windowHeight);
        const total = elementHeight + windowHeight;
        const percentage = Math.min(100, Math.max(0, (scrolled / total) * 100));
        
        setProgress(percentage);
      } else {
        // Fallback to page scroll
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const percentage = (scrollTop / docHeight) * 100;
        setProgress(percentage);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll);
  }, [target]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200">
      <div
        className="h-full bg-[#E31E24] transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
