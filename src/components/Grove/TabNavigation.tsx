import { Leaf, Users } from "lucide-react";

type TabType = 'my-vine' | 'grove';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="max-w-md mx-auto px-4 pb-4">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-1 flex">
          <button
            onClick={() => onTabChange('my-vine')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'my-vine'
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
                : 'text-muted-foreground hover:bg-muted/50'
            }`}
          >
            <Leaf className="w-4 h-4" />
            My Vine
          </button>
          <button
            onClick={() => onTabChange('grove')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'grove'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                : 'text-muted-foreground hover:bg-muted/50'
            }`}
          >
            <Users className="w-4 h-4" />
            The Grove
          </button>
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;