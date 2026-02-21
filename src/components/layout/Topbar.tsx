import {
    Search,
    Bell,
    Mic,
    Plus,
    ChevronRight
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLocation } from 'react-router-dom';

const getPageTitle = (pathname: string) => {
    if (pathname === '/dashboard') return 'Overview';
    if (pathname.includes('/calendar')) return 'Calendar';
    if (pathname.includes('/approvals')) return 'Approvals';
    if (pathname.includes('/brand-kit')) return 'Brand Kit';
    if (pathname.includes('/content-plan')) return 'Content Plan';
    if (pathname.includes('/insights')) return 'Insights';
    return 'Dashboard';
};

export const Topbar = () => {
    const location = useLocation();
    const pageTitle = getPageTitle(location.pathname);

    return (
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-30">
            {/* Breadcrumbs & Title */}
            <div className="flex flex-col">
                <div className="flex items-center space-x-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    <span>Main Dashboard</span>
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-gray-900">{pageTitle}</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">{pageTitle}</h1>
            </div>

            {/* Global Search */}
            <div className="flex-1 max-w-lg mx-8">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                    <Input
                        placeholder="Search for posts, topics, or insights..."
                        className="w-full h-11 bg-gray-50 border-transparent rounded-xl pl-11 pr-11 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all text-sm font-medium"
                    />
                    <Mic className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-indigo-600 cursor-pointer transition-colors" />
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-2 bg-gray-50 p-1 rounded-xl border border-gray-100 mr-4">
                    <button className="px-4 py-2 bg-white text-indigo-600 shadow-sm rounded-lg text-xs font-bold transition-all">
                        All
                    </button>
                    <button className="px-4 py-2 text-gray-500 hover:text-gray-900 text-xs font-bold transition-all">
                        Dribbble
                    </button>
                    <button className="px-4 py-2 text-gray-500 hover:text-gray-900 text-xs font-bold transition-all">
                        Instagram
                    </button>
                </div>

                <button className="relative p-3 text-gray-500 hover:bg-gray-50 rounded-xl transition-colors group">
                    <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white" />
                </button>

                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-indigo-100 flex items-center space-x-2 group">
                    <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform" />
                    <span>Create Post</span>
                </Button>
            </div>
        </header>
    );
};
