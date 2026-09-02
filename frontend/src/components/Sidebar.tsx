import React from 'react';
import { 
  LayoutDashboard, 
  FilePlus, 
  TrendingUp, 
  Ship, 
  MapPin, 
  Calculator, 
  ShieldAlert, 
  FileText, 
  Sliders, 
  Award, 
  Database, 
  Cpu 
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'cargo', label: 'Cargo Request', icon: FilePlus },
    { id: 'forecast', label: 'Freight Forecast', icon: TrendingUp },
    { id: 'vessels', label: 'Vessels Explorer', icon: Ship },
    { id: 'ports', label: 'Ports & Map', icon: MapPin },
    { id: 'cost', label: 'Cost Analysis', icon: Calculator },
    { id: 'risk', label: 'Risk & Alerts', icon: ShieldAlert },
    { id: 'contracts', label: 'Contract Strategy', icon: FileText },
    { id: 'whatif', label: 'What-If Simulator', icon: Sliders },
    { id: 'recommendation', label: 'Final Recommendation', icon: Award, highlight: true },
  ];

  const secondaryItems = [
    { id: 'datacenter', label: 'Data Center', icon: Database },
    { id: 'modelperformance', label: 'Model Performance', icon: Cpu },
  ];

  return (
    <aside className="w-64 bg-slate-50/90 border-r border-slate-200/80 flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-1">
        <div className="px-3 py-2 text-xs font-semibold text-slate-500 tracking-wider uppercase font-mono">
          Decision Support Pipeline
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-cyan-100/80 text-cyan-900 border border-cyan-300 shadow-sm font-semibold'
                  : item.highlight
                  ? 'bg-teal-50 text-teal-800 border border-teal-200/80 hover:bg-teal-100/70'
                  : 'text-slate-700 hover:bg-slate-200/60 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-700' : item.highlight ? 'text-teal-600' : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="pt-4 border-t border-slate-200 space-y-1">
        <div className="px-3 py-1 text-xs font-semibold text-slate-500 tracking-wider uppercase font-mono">
          System Metrics
        </div>
        {secondaryItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-cyan-100/80 text-cyan-900 border border-cyan-300 font-semibold'
                  : 'text-slate-700 hover:bg-slate-200/60 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-700' : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
