import { useState, useEffect } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie
} from 'recharts';
import {
    TrendingUp,
    Users,
    MessageSquare,
    Heart,
    Share2,
    ArrowUpRight,
    ArrowDownRight,
    Image
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const reachData = [
    { name: 'Mon', reach: 4000 },
    { name: 'Tue', reach: 3000 },
    { name: 'Wed', reach: 2000 },
    { name: 'Thu', reach: 2780 },
    { name: 'Fri', reach: 1890 },
    { name: 'Sat', reach: 2390 },
    { name: 'Sun', reach: 3490 },
];

const platformData = [
    { name: 'Instagram', value: 45 },
    { name: 'LinkedIn', value: 30 },
    { name: 'Twitter', value: 15 },
    { name: 'Facebook', value: 10 },
];

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

export const Insights = () => {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Insights</h1>
                    <p className="text-gray-500 font-medium">Post performance and audience growth analytics.</p>
                </div>
                <div className="flex items-center space-x-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                    <Badge variant="secondary" className="bg-gray-50 text-gray-700 hover:bg-gray-100 cursor-pointer h-10 px-6 rounded-xl font-bold">Last 7 Days</Badge>
                    <Badge variant="outline" className="text-gray-400 hover:text-gray-600 cursor-pointer h-10 px-6 rounded-xl font-medium border-none shadow-none">Last 30 Days</Badge>
                </div>
            </div>

            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard
                    title="Total Reach"
                    value="24.8k"
                    change="+12.5%"
                    positive={true}
                    icon={<TrendingUp className="h-6 w-6 text-indigo-600" />}
                />
                <StatCard
                    title="Avg. Engagement"
                    value="4.2%"
                    change="+0.8%"
                    positive={true}
                    icon={<Heart className="h-6 w-6 text-red-500" />}
                />
                <StatCard
                    title="New Followers"
                    value="842"
                    change="-2.4%"
                    positive={false}
                    icon={<Users className="h-6 w-6 text-green-600" />}
                />
                <StatCard
                    title="Post Shares"
                    value="156"
                    change="+18.2%"
                    positive={true}
                    icon={<Share2 className="h-6 w-6 text-blue-500" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Reach Chart */}
                <Card className="lg:col-span-2 rounded-3xl border-gray-100 shadow-sm overflow-hidden">
                    <CardHeader className="p-8 border-b border-gray-50 bg-gray-50/30">
                        <CardTitle className="text-xl font-black flex items-center space-x-2">
                            <span>Reach Overview</span>
                            <Badge className="bg-green-50 text-green-700 border-none font-bold ml-4">Live</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="h-[400px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={reachData}>
                                    <defs>
                                        <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
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
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="reach"
                                        stroke="#4F46E5"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorReach)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Platform Distribution */}
                <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden">
                    <CardHeader className="p-8 border-b border-gray-50 bg-gray-50/30">
                        <CardTitle className="text-xl font-black">Engagement by Platform</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="h-[300px] w-full flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={platformData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={8}
                                        dataKey="value"
                                    >
                                        {platformData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-4 mt-8">
                            {platformData.map((entry, index) => (
                                <div key={entry.name} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                                        <span className="text-sm font-bold text-gray-600">{entry.name}</span>
                                    </div>
                                    <span className="text-sm font-black text-gray-900">{entry.value}%</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Content */}
            <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden">
                <CardHeader className="p-8 border-b border-gray-50 bg-gray-50/30">
                    <CardTitle className="text-xl font-black">Top Performing Posts</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="group relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                                    <Badge className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-900 font-black">#{i} Rank</Badge>
                                    <Image className="h-8 w-8 text-gray-300" />
                                </div>
                                <div className="p-6">
                                    <p className="text-sm font-bold text-gray-800 line-clamp-2 mb-4">"The 5 Secrets to Brand Storytelling that actually converts..."</p>
                                    <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-gray-400">
                                        <div className="flex items-center space-x-4">
                                            <span className="flex items-center space-x-1">
                                                <Heart className="h-3 w-3 text-red-500" />
                                                <span>1.2k</span>
                                            </span>
                                            <span className="flex items-center space-x-1">
                                                <MessageSquare className="h-3 w-3 text-blue-500" />
                                                <span>48</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

const StatCard = ({ title, value, change, positive, icon }: any) => (
    <Card className="rounded-3xl border-gray-100 shadow-sm p-8 space-y-4 hover:shadow-md transition-shadow group">
        <div className="flex items-center justify-between">
            <div className="h-12 w-12 rounded-2xl bg-gray-50 group-hover:bg-indigo-50 transition-colors flex items-center justify-center">
                {icon}
            </div>
            <div className={cn(
                "flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase",
                positive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            )}>
                {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                <span>{change}</span>
            </div>
        </div>
        <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{title}</p>
            <h3 className="text-3xl font-black text-gray-900 mt-1">{value}</h3>
        </div>
    </Card>
);

