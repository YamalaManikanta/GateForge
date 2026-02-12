import React, { useState, useEffect } from 'react';
import Dashboard from '@/components/Dashboard';
import MockTracker from '@/components/MockTracker';
import ErrorLog from '@/components/ErrorLog';
import DailyTracker from '@/components/DailyTracker';
import StrategySimulator from '@/components/StrategySimulator';
import SubjectYield from '@/components/SubjectYield';
import Welcome from '@/components/Welcome';
import DataControl from '@/components/DataControl';
import SyllabusInfo from '@/components/SyllabusInfo';
import SyllabusTracker from '@/components/SyllabusTracker';
import CalendarView from '@/components/CalendarView';
import VirtualCalculator from '@/components/VirtualCalculator';
import FlashcardDeck from '@/components/FlashcardDeck';
import CodeRunner from '@/components/CodeRunner';
import Gauntlet from '@/components/Gauntlet';
import Onboarding from '@/components/Onboarding';
import DependencyGraph from '@/components/DependencyGraph';
import UserManual from '@/components/UserManual';
import { getMocks, getDailyLogs, getSyllabusStatus, getUserProfile } from '@/services/storageService';
import { LayoutDashboard, PenTool, AlertCircle, Calendar, Cpu, TrendingUp, Home, Settings, BookOpen, Clock, CalendarRange, Calculator, Brain, Award, Zap, GitBranch, Terminal } from 'lucide-react';

enum Tab {
  HOME = 'Home',
  DASHBOARD = 'Dashboard',
  PLAN = 'Master Plan', 
  DEPENDENCY = 'Dependency Map',
  RUNNER = 'Code Runner',
  GAUNTLET = 'Gauntlet',
  CALENDAR = 'Calendar',
  MEMORY = 'Memory Forge',
  MOCKS = 'Mocks',
  ERRORS = 'Error Log',
  DAILY = 'Daily',
  STRATEGY = 'Strategy',
  YIELD = 'Subject Yield',
  SYLLABUS = 'Syllabus & Info',
  CALCULATOR = 'Calculator',
  SETTINGS = 'Settings'
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.HOME);
  const [rankInfo, setRankInfo] = useState({ title: 'Novice', level: 1, progress: 0 });
  const [isSetup, setIsSetup] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(true);
  const [showManual, setShowManual] = useState(false);

  useEffect(() => {
    // Check Setup
    const profile = getUserProfile();
    setIsSetup(profile.isSetupComplete);
    setCheckingSetup(false);

    if (profile.isSetupComplete) {
      calculateRank();
    }
  }, [activeTab]);

  const calculateRank = () => {
    const mocks = getMocks();
    const logs = getDailyLogs();
    const syllabus = getSyllabusStatus();
    let xp = mocks.length * 100 + logs.length * 50;
    Object.values(syllabus).forEach(s => { if (s.completed) xp += 200; });
    const level = Math.floor(xp / 500) + 1;
    const progress = (xp % 500) / 500 * 100;
    let title = level > 5 ? 'Adept Forger' : 'Novice Smith';
    if (level > 15) title = 'Iron Architect';
    setRankInfo({ title, level, progress });
  };

  const handleOnboardingComplete = () => {
    setIsSetup(true);
    calculateRank();
  };

  const renderContent = () => {
    switch (activeTab) {
      case Tab.HOME: return <Welcome onNavigate={(t) => setActiveTab(t as Tab)} />;
      case Tab.DASHBOARD: return <Dashboard />;
      case Tab.PLAN: return <SyllabusTracker />;
      case Tab.DEPENDENCY: return <DependencyGraph />;
      case Tab.RUNNER: return <CodeRunner />;
      case Tab.GAUNTLET: return <Gauntlet />;
      case Tab.CALENDAR: return <CalendarView />;
      case Tab.MEMORY: return <FlashcardDeck />;
      case Tab.MOCKS: return <MockTracker />;
      case Tab.ERRORS: return <ErrorLog />;
      case Tab.DAILY: return <DailyTracker />;
      case Tab.STRATEGY: return <StrategySimulator />;
      case Tab.YIELD: return <SubjectYield />;
      case Tab.SYLLABUS: return <SyllabusInfo />;
      case Tab.CALCULATOR: return <VirtualCalculator />;
      case Tab.SETTINGS: return <DataControl />;
      default: return <Welcome onNavigate={(t) => setActiveTab(t as Tab)} />;
    }
  };

  const NavItem = ({ tab, icon: Icon }: { tab: Tab, icon: any }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium rounded-lg transition-all group relative overflow-hidden ${
        activeTab === tab 
          ? 'text-gate-100 bg-gate-100/10 shadow-sm' 
          : 'text-gate-500 hover:text-gate-200 hover:bg-gate-100/5'
      }`}
    >
      <Icon size={16} className={`relative z-10 transition-transform duration-300 ${activeTab === tab ? 'text-gate-100' : 'text-gate-500 group-hover:text-gate-300'}`} />
      <span className="relative z-10 tracking-wide">{tab}</span>
      {activeTab === tab && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gate-100 rounded-r-full"></div>}
    </button>
  );

  if (checkingSetup) return <div className="min-h-screen bg-gate-950"></div>;

  if (!isSetup) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-gate-950 flex text-gate-300 font-sans selection:bg-gate-200 selection:text-gate-950 overflow-hidden relative transition-colors duration-300">
      <div className="fixed inset-0 bg-grid-pattern z-0 opacity-40"></div>
      
      <aside className="w-64 bg-gate-950/80 backdrop-blur-2xl border-r border-gate-800 hidden md:flex flex-col fixed h-full z-30 shadow-2xl print:hidden">
        <div className="p-6 pb-2">
          <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold tracking-tighter text-gate-100 flex items-center gap-3">
                <div className="w-8 h-8 bg-gate-100 rounded flex items-center justify-center">
                    <Terminal size={18} className="text-gate-950" />
                </div>
                GATE FORGE
              </h1>
          </div>
          
          <button 
            onClick={() => setShowManual(true)} 
            className="w-full flex items-center justify-center gap-2 px-3 py-2 mt-2 bg-gate-900 hover:bg-gate-800 border border-gate-700 rounded-lg text-xs font-bold text-gate-400 hover:text-white transition-colors"
          >
             <BookOpen size={14} /> USER MANUAL
          </button>
          
          <div className="mt-6 bg-gate-900/50 p-4 rounded-xl border border-gate-800 hover:border-gate-700 transition-colors group">
             <div className="flex justify-between items-center mb-2">
                <div className="text-[10px] uppercase font-bold text-gate-500 tracking-wider">Current Rank</div>
                <div className="text-[10px] font-mono text-gate-400">LVL {rankInfo.level}</div>
             </div>
             <div className="text-sm font-bold text-gate-100 flex items-center gap-2 mb-3">
                <Award size={16} className="text-yellow-500"/> 
                {rankInfo.title}
             </div>
             <div className="w-full h-1.5 bg-gate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gate-100 transition-all duration-1000 ease-out group-hover:bg-blue-400" style={{width: `${rankInfo.progress}%`}}></div>
             </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4 scrollbar-none">
          <div className="text-[10px] font-bold text-gate-600 uppercase tracking-widest px-4 mb-2">Main</div>
          <NavItem tab={Tab.HOME} icon={Home} />
          <NavItem tab={Tab.DASHBOARD} icon={LayoutDashboard} />
          <NavItem tab={Tab.PLAN} icon={Clock} />
          <NavItem tab={Tab.CALENDAR} icon={CalendarRange} />
          
          <div className="text-[10px] font-bold text-gate-600 uppercase tracking-widest px-4 mb-2 mt-6">Knowledge</div>
          <NavItem tab={Tab.SYLLABUS} icon={BookOpen} />
          <NavItem tab={Tab.DEPENDENCY} icon={GitBranch} />
          <NavItem tab={Tab.MEMORY} icon={Brain} />
          
          <div className="text-[10px] font-bold text-gate-600 uppercase tracking-widest px-4 mb-2 mt-6">Practice</div>
          <NavItem tab={Tab.MOCKS} icon={PenTool} />
          <NavItem tab={Tab.ERRORS} icon={AlertCircle} />
          <NavItem tab={Tab.RUNNER} icon={Cpu} />
          <NavItem tab={Tab.GAUNTLET} icon={Zap} />
          <NavItem tab={Tab.CALCULATOR} icon={Calculator} />
          
          <div className="text-[10px] font-bold text-gate-600 uppercase tracking-widest px-4 mb-2 mt-6">Analytics</div>
          <NavItem tab={Tab.DAILY} icon={Calendar} />
          <NavItem tab={Tab.YIELD} icon={TrendingUp} />
          <NavItem tab={Tab.STRATEGY} icon={Cpu} />
          
          <div className="my-4 h-px bg-gate-800 mx-4"></div>
          <NavItem tab={Tab.SETTINGS} icon={Settings} />
        </nav>
      </aside>

      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto h-screen relative z-10 scrollbar-none print:h-auto print:overflow-visible">
        <div key={activeTab} className="max-w-6xl mx-auto h-full animate-fade-in pb-12 print:h-auto print:pb-0">
            {renderContent()}
        </div>
      </main>

      {showManual && <UserManual onClose={() => setShowManual(false)} />}
    </div>
  );
};

export default App;