import { cn } from '@/lib/utils';

interface Tab {
  label: string;
  value: string;
}

interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        'flex gap-2 overflow-x-auto pb-2 scrollbar-hide',
        'scroll-smooth snap-x snap-mandatory',
        className
      )}
      role="tablist"
      aria-label="Категории меню"
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          role="tab"
          aria-selected={active === tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'px-5 py-2.5 rounded-pill text-small font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer flex-shrink-0 snap-start',
            active === tab.value
              ? 'bg-bg-dark text-text-inverse'
              : 'bg-transparent text-text-secondary hover:text-text-primary hover:underline'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
