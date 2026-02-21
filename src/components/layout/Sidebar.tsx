import React from 'react';
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
    Plus
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
import { Button } from '@/components/ui/button';

const navItems = [
    { icon: Home, label: 'Overview', path: '/dashboard' },
    { icon: Calendar, label: 'Calendar', path: '/dashboard/calendar' },
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

export const Sidebar = () => {
    const { user, profile, signOut } = useAuthStore();
    const { currentWorkspace } = useWorkspaceStore();
    const navigate = useNavigate();

    return (
        <aside className="w-72 bg-white border-r border-gray-100 flex flex-col h-screen fixed left-0 top-0 z-40">
            {/* Workspace Switcher */}
            <div className="p-6">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors group">
                            <div className="flex items-center space-x-3 text-left">
                                <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-xl">TRACKLY</span>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 truncate">
                                        {currentWorkspace?.name || 'My Brand'}
                                    </h3>
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                                        {profile?.plan || 'Basic'} Plan
                                    </p>
                                </div>
                            </div>
                            <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64" align="start">
                        <DropdownMenuItem className="py-3 px-4 flex items-center space-x-2">
                            <Plus className="h-4 w-4" />
                            <span>Create New Workspace</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Main Nav */}
            <nav className="flex-1 px-4 space-y-2 overflow-y-auto mt-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.label}
                        to={item.path}
                        end={item.path === '/dashboard'}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                isActive
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                                    : "text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
                            )
                        }
                    >
                        <item.icon className="h-5 w-5" />
                        <span className="font-semibold text-sm">{item.label}</span>
                    </NavLink>
                ))}

                <div className="pt-8 pb-4">
                    <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Account</p>
                    {secondaryNav.map((item) => (
                        <NavLink
                            key={item.label}
                            to={item.path}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                    isActive
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                                        : "text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
                                )
                            }
                        >
                            <item.icon className="h-5 w-5" />
                            <span className="font-semibold text-sm">{item.label}</span>
                        </NavLink>
                    ))}
                </div>
            </nav>

            {/* User Profile */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10 ring-2 ring-indigo-50">
                            <AvatarImage src={profile?.avatar_url} />
                            <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold uppercase">
                                {profile?.full_name?.charAt(0) || user?.email?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900 truncate max-w-[100px]">
                                {profile?.full_name || 'User'}
                            </span>
                            <span className="text-[10px] font-medium text-gray-400 uppercase">
                                Free Trial
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => signOut()}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                    </button>
                </div>

                <Button className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold h-11 rounded-xl shadow-md border-none group">
                    Upgrade Pro
                    <Target className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                </Button>
            </div>
        </aside>
    );
};
