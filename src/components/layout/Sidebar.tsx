import { NavLink, useNavigate } from 'react-router-dom';
import {
    Home,
    Calendar,
    CheckCircle,
    Target,
    Megaphone,
    BarChart2,
    Shield,
    Settings,
    Users,
    LogOut,
    ChevronDown,
    Plus,
    Share2,
    Zap
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const navItems = [
    { icon: Home, label: 'Overview', path: '/dashboard' },
    { icon: Calendar, label: 'Calendar', path: '/dashboard/calendar' },
    { icon: Share2, label: 'Connect Socials', path: '/dashboard/integrations' },
    { icon: CheckCircle, label: 'Approvals', path: '/dashboard/approvals' },
    { icon: Target, label: 'Content Plan', path: '/dashboard/content-plan' },
    { icon: Megaphone, label: 'Paid Ads', path: '/dashboard/paid-ads' },
    { icon: BarChart2, label: 'Insights', path: '/dashboard/insights' },
];

const secondaryNav = [
    { icon: Shield, label: 'Brand Kit', path: '/dashboard/brand-kit' },
    { icon: Users, label: 'Collaborators', path: '/dashboard/collaborators' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
];

const utilityNav = [
    { icon: Zap, label: 'Refer & Earn', path: '/dashboard/refer' },
    { icon: Users, label: 'Join Community', path: '/dashboard/community' },
    { icon: Shield, label: 'Help & Learn', path: '/dashboard/help' },
];

const WorkspaceSwitcher = () => {
    const navigate = useNavigate();
    const { currentWorkspace, workspaces, fetchWorkspace } = useWorkspaceStore();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors group"
                    aria-label={`Switch workspace. Current: ${currentWorkspace?.name || 'Select Workspace'}`}
                >
                    <div className="flex items-center space-x-3 text-left">
                        <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">
                                {currentWorkspace?.name?.[0]?.toUpperCase() || 'T'}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900 truncate w-32">
                                {currentWorkspace?.name || 'Select Workspace'}
                            </p>
                            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-tighter">
                                {currentWorkspace ? 'Active Brand' : 'No Brand Selected'}
                            </p>
                        </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[260px] rounded-2xl p-2 bg-white shadow-2xl border-gray-100">
                <p className="px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">My Brands</p>
                <div className="max-h-[300px] overflow-y-auto">
                    {workspaces.map((ws) => (
                        <DropdownMenuItem
                            key={ws.id}
                            className={cn(
                                "rounded-xl font-bold p-3 mb-1 cursor-pointer transition-all",
                                currentWorkspace?.id === ws.id
                                    ? "bg-indigo-50 text-indigo-600"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                            onClick={() => fetchWorkspace(ws.id)}
                        >
                            <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 text-xs">
                                {ws.name?.[0]?.toUpperCase()}
                            </div>
                            <span className="truncate flex-1">{ws.name}</span>
                            {currentWorkspace?.id === ws.id && (
                                <Zap className="h-3 w-3 fill-indigo-600 text-indigo-600 ml-2" />
                            )}
                        </DropdownMenuItem>
                    ))}
                </div>

                <div className="h-px bg-gray-100 my-2" />

                <DropdownMenuItem
                    className="rounded-xl font-black p-3 text-indigo-600 hover:bg-indigo-50 cursor-pointer flex items-center justify-center group/btn"
                    onClick={() => navigate('/onboarding/start')}
                >
                    <Plus className="h-4 w-4 mr-2 group-hover/btn:rotate-90 transition-transform" />
                    CREATE NEW BRAND
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export const Sidebar = () => {
    const { profile, signOut } = useAuthStore();

    const credits = profile?.credits_remaining ?? 0;
    const maxCredits = 200;
    const creditPercentage = (credits / maxCredits) * 100;

    return (
        <aside
            className="w-72 bg-white border-r border-gray-100 flex flex-col h-screen fixed left-0 top-0 z-40"
            role="complementary"
            aria-label="Main Sidebar"
        >
            {/* Workspace Switcher */}
            <div className="p-6">
                <WorkspaceSwitcher />
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-8 overflow-y-auto" aria-label="Primary Navigation">
                <div className="space-y-1">
                    <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Main Menu</p>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => cn(
                                "flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 group",
                                isActive
                                    ? "bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100/50"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <item.icon className={cn(
                                "h-5 w-5 transition-colors",
                                "group-hover:text-indigo-600"
                            )} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </div>

                <div className="space-y-1">
                    <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Organization</p>
                    {secondaryNav.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => cn(
                                "flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 group",
                                isActive
                                    ? "bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100/50"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <item.icon className="h-5 w-5 group-hover:text-indigo-600 transition-colors" />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </div>

                <div className="space-y-1">
                    <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Support & Team</p>
                    {utilityNav.map((item) => (
                        <NavLink
                            key={item.label}
                            to={item.path}
                            className={({ isActive }) => cn(
                                "flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 group",
                                isActive
                                    ? "bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100/50"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <item.icon className="h-5 w-5 group-hover:text-indigo-600 transition-colors" />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </div>

                {/* Credit Widget */}
                <div className="px-4 pt-4">
                    <div className="bg-indigo-600 rounded-3xl p-6 relative overflow-hidden shadow-xl shadow-indigo-100 group">
                        <div className="absolute -top-4 -right-4 h-24 w-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                                    <Zap className="h-5 w-5 text-white" />
                                </div>
                                <Badge className="bg-white/20 text-white border-none text-[10px] font-black tracking-tighter cursor-default">
                                    {profile?.plan || 'Free Plan'}
                                </Badge>
                            </div>
                            <div>
                                <div className="flex items-end justify-between mb-2">
                                    <p className="text-white text-2xl font-black">{credits}</p>
                                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Credits Left</p>
                                </div>
                                <Progress value={creditPercentage} className="h-2 bg-black/20" />
                            </div>
                            <button className="w-full bg-white text-indigo-600 h-10 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors shadow-lg shadow-black/5">
                                Upgrade Now
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* User Profile */}
            <div className="p-6 border-t border-gray-100">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className="w-full flex items-center justify-between p-2 rounded-2xl hover:bg-gray-50 transition-colors group"
                            aria-label={`User menu for ${profile?.full_name || 'My Brand'}`}
                        >
                            <div className="flex items-center space-x-3">
                                <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                    <AvatarImage src={profile?.avatar_url} />
                                    <AvatarFallback className="bg-indigo-100 text-indigo-600 font-bold">
                                        {profile?.full_name?.substring(0, 2).toUpperCase() || 'BF'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-gray-900 truncate w-24">
                                        {profile?.full_name || 'My Brand'}
                                    </p>
                                    <p className="text-[10px] font-medium text-gray-500">
                                        {profile?.plan || 'Free'} Plan
                                    </p>
                                </div>
                            </div>
                            <MoreVertical className="h-4 w-4 text-gray-400 group-hover:text-gray-900 transition-colors" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px] rounded-2xl p-2">
                        <DropdownMenuItem
                            className="rounded-xl font-medium p-3 text-red-600 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                            onClick={() => signOut()}
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </aside>
    );
};

export const MoreVertical = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
);
