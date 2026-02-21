import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
    TrendingUp,
    Users,
    Calendar,
    CheckCircle,
    BarChart3,
    ArrowUpRight,
    Clock
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const data = [
    { name: 'Mon', value: 400 },
    { name: 'Tue', value: 300 },
    { name: 'Wed', value: 600 },
    { name: 'Thu', value: 800 },
    { name: 'Fri', value: 500 },
    { name: 'Sat', value: 900 },
    { name: 'Sun', value: 1000 },
];

export const DashboardOverview = () => {
    const { currentWorkspace, brandProfile } = useWorkspaceStore();
    const [stats, setStats] = useState({
        totalPosts: 0,
        pendingApprovals: 0,
        scheduledPosts: 0,
        activeIntegrations: 0
    });

    useEffect(() => {
        if (!currentWorkspace) return;

        const fetchStats = async () => {
            const { count: postsCount } = await supabase
                .from('posts')
                .select('*', { count: 'exact', head: true })
                .eq('workspace_id', currentWorkspace.id);

            const { count: pendingCount } = await supabase
                .from('topics')
                .select('*', { count: 'exact', head: true })
                .eq('workspace_id', currentWorkspace.id)
                .eq('approved', false);

            setStats({
                totalPosts: postsCount || 0,
                pendingApprovals: pendingCount || 0,
                scheduledPosts: 0,
                activeIntegrations: 0
            });
        };

        fetchStats();
    }, [currentWorkspace]);

    return (
        <div className="space-y-8 p-8">
            {/* Welcome Banner */}
            <div className="bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-100">
                <div className="relative z-10 space-y-2">
                    <h2 className="text-3xl font-extrabold tracking-tight">
                        Welcome back, {brandProfile?.business_name || 'Innovator'}!
                    </h2>
                    <p className="text-indigo-100 text-lg opacity-90 max-w-xl">
                        Your brand identity is set. We've generated 14 new content topics for the next two weeks.
                        Review and approve them to start generating posts.
                    </p>
                    <div className="pt-4 flex items-center space-x-4">
                        <button className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg">
                            Review Content Plan
                        </button>
                        <button className="bg-indigo-500/30 text-white border border-white/20 px-6 py-3 rounded-xl font-bold hover:bg-indigo-500/40 transition-colors backdrop-blur-sm">
                            View Analytics
                        </button>
                    </div>
                </div>
                <div className="absolute top-0 right-0 p-8 h-full flex flex-col justify-center opacity-20 transform translate-x-1/4">
                    <BarChart3 className="h-64 w-64" />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Pending Approvals', value: stats.pendingApprovals, icon: CheckCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
                    { label: 'Scheduled Posts', value: stats.scheduledPosts, icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Total Published', value: stats.totalPosts, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Integrations', value: stats.activeIntegrations, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                ].map((stat) => (
                    <Card key={stat.label} className="border-none shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={cn("p-2.5 rounded-xl", stat.bg)}>
                                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                                </div>
                                <div className="flex items-center text-green-600 text-xs font-bold bg-green-50 px-2 py-0.5 rounded-full">
                                    <ArrowUpRight className="h-3 w-3 mr-0.5" />
                                    12%
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-3xl font-black text-gray-900 mt-1">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl overflow-hidden">
                    <CardHeader className="p-8 border-b border-gray-50 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-extrabold text-gray-900">Reach Overview</CardTitle>
                            <p className="text-sm text-gray-500 font-medium mt-1">Total impressions across all platforms</p>
                        </div>
                        <select className="bg-gray-50 border-none rounded-lg px-4 py-2 text-sm font-bold text-gray-600 focus:ring-2 focus:ring-indigo-100 outline-none">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                        </select>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }}
                                        dy={10}
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#4F46E5"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorValue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                    <CardHeader className="p-8 border-b border-gray-50">
                        <CardTitle className="text-xl font-extrabold text-gray-900">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-start space-x-4">
                                <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                                    <Clock className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 leading-tight">
                                        Topic Generated: "The Future of AI in Branding"
                                    </p>
                                    <p className="text-xs text-gray-500 font-medium mt-1">{i * 2} hours ago</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
