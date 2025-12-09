import { useEffect, useState } from 'react';
import { List, ChevronRight } from 'lucide-react';

type TOCItem = {
  id: string;
  text: string;
  level: number;
};

type TableOfContentsProps = {
  content: string;
};

export function TableOfContents({ content }: TableOfContentsProps) {
  const [toc, setToc] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Parse HTML content to extract headings
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headings = doc.querySelectorAll('h2, h3');

    const items: TOCItem[] = Array.from(headings).map((heading, index) => {
      const id = `heading-${index}`;
      const level = parseInt(heading.tagName.charAt(1));
      const text = heading.textContent || '';
      
      // Add ID to actual headings in the page for scrolling
      setTimeout(() => {
        const actualHeading = document.querySelectorAll('h2, h3')[index];
        if (actualHeading) {
          actualHeading.id = id;
        }
      }, 100);

      return { id, text, level };
    });

    setToc(items);
  }, [content]);

  useEffect(() => {
    const handleScroll = () => {
      const headings = document.querySelectorAll('h2, h3');
      let currentActive = '';

      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect();
        if (rect.top >= 0 && rect.top <= 200) {
          currentActive = heading.id;
        }
      });

      if (currentActive) {
        setActiveId(currentActive);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100; // Offset for fixed header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  if (toc.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 sticky top-24">
      <div className="flex items-center gap-2 mb-4">
        <List className="size-5 text-gray-700" />
        <h3 className="font-semibold text-gray-900">Índice do Artigo</h3>
      </div>

      <nav className="space-y-1">
        {toc.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToHeading(item.id)}
            className={`w-full text-left text-sm py-2 px-3 rounded transition-all ${
              item.level === 3 ? 'pl-6' : ''
            } ${
              activeId === item.id
                ? 'bg-[#E31E24] text-white font-medium'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {activeId === item.id && (
                <ChevronRight className="size-3 flex-shrink-0" />
              )}
              <span className="line-clamp-2">{item.text}</span>
            </div>
          </button>
        ))}
      </nav>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          {toc.length} {toc.length === 1 ? 'secção' : 'secções'}
        </div>
      </div>
    </div>
  );
}
