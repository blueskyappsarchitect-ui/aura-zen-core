import { Leaf, Users } from "lucide-react";
import { BANNER_HEIGHT } from "@/components/AdMobBanner";

type TabType = 'my-vine' | 'grove';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
  return (
    <div className="fixed left-0 right-0 z-50 pb-safe" style={{ bottom: BANNER_HEIGHT }}>
      <div className="max-w-md mx-auto px-4 pb-4">
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/40 p-1 flex" style={{ backdropFilter: 'blur(12px)' }}>
          <button
            onClick={() => onTabChange('my-vine')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-300 ease-in-out touch-manipulation min-h-[48px] ${
              activeTab === 'my-vine'
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
                : 'text-muted-foreground hover:bg-muted/50 active:bg-muted/70'
            }`}
          >
            <Leaf className="w-4 h-4" />
            My Vine
          </button>
          <button
            onClick={() => onTabChange('grove')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-300 ease-in-out touch-manipulation min-h-[48px] ${
              activeTab === 'grove'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                : 'text-muted-foreground hover:bg-muted/50 active:bg-muted/70'
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