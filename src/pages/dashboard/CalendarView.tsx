import { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import type { View } from 'react-big-calendar';
import { format } from 'date-fns';
import { parse } from 'date-fns';
import { startOfWeek } from 'date-fns';
import { getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { supabase } from '@/lib/supabase';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { Instagram, Linkedin, Twitter, Facebook, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PostEditor } from './PostEditor';

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const PLATFORM_ICONS: Record<string, any> = {
    instagram: Instagram,
    linkedin: Linkedin,
    twitter: Twitter,
    facebook: Facebook,
};

interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    resource: {
        status: string;
        platform: string;
        type: string;
    };
}

export const CalendarView = () => {
    const { currentWorkspace } = useWorkspaceStore();
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [view, setView] = useState<View>('month');
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    useEffect(() => {
        if (!currentWorkspace) return;

        const fetchPosts = async () => {
            const { data: posts } = await supabase
                .from('posts')
                .select('*')
                .eq('workspace_id', currentWorkspace.id);

            if (posts) {
                const calendarEvents = posts.map((post: any) => ({
                    id: post.id,
                    title: post.caption || 'Untitled Post',
                    start: new Date(post.scheduled_at || post.created_at),
                    end: new Date(new Date(post.scheduled_at || post.created_at).getTime() + 60 * 60 * 1000),
                    resource: {
                        status: post.status,
                        platform: post.platform,
                        type: post.post_type,
                    },
                }));
                setEvents(calendarEvents);
            }
            // setLoading(false);
        };

        fetchPosts();
    }, [currentWorkspace]);

    const eventStyleGetter = (event: CalendarEvent) => {
        let backgroundColor = '#4F46E5'; // Indigo-600 default
        if (event.resource.status === 'draft') backgroundColor = '#94A3B8'; // Slate-400
        if (event.resource.status === 'approved') backgroundColor = '#10B981'; // Emerald-500
        if (event.resource.status === 'scheduled') backgroundColor = '#6366F1'; // Indigo-500

        return {
            style: {
                backgroundColor,
                borderRadius: '8px',
                opacity: 0.9,
                color: 'white',
                border: '0px',
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                padding: '2px 8px',
            },
        };
    };

    const EventComponent = ({ event }: { event: CalendarEvent }) => {
        const Icon = PLATFORM_ICONS[event.resource.platform] || Sparkles;

        return (
            <div className="flex items-center space-x-2 truncate">
                <Icon className="h-3 w-3" />
                <span className="truncate">{event.title}</span>
            </div>
        );
    };

    return (
        <div className="h-full bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Content Calendar</h1>
                    <p className="text-gray-500 font-medium">Manage and schedule your generated post ideas.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Badge className="bg-green-50 text-green-700 border-none font-bold uppercase tracking-widest text-[10px] px-3 py-1">
                        {events.length} Posts Generated
                    </Badge>
                    <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 flex items-center space-x-2">
                        <Sparkles className="h-4 w-4" />
                        <span>AI Generate More</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 min-h-[600px] relative">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    eventPropGetter={eventStyleGetter}
                    onView={(newView) => setView(newView)}
                    view={view}
                    onSelectEvent={(event) => {
                        setSelectedPostId(event.id);
                        setIsEditorOpen(true);
                    }}
                    components={{
                        event: EventComponent,
                    }}
                    className="brandforge-calendar"
                />
            </div>

            <PostEditor
                postId={selectedPostId}
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
            />

            <style dangerouslySetInnerHTML={{
                __html: `
        .brandforge-calendar .rbc-header {
          padding: 12px 0;
          font-weight: 800;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.05em;
          color: #94A3B8;
          border-bottom: 1px solid #F1F5F9;
        }
        .brandforge-calendar .rbc-month-view {
          border: 1px solid #F1F5F9;
          border-radius: 20px;
          overflow: hidden;
        }
        .brandforge-calendar .rbc-day-bg {
          border-left: 1px solid #F1F5F9;
        }
        .brandforge-calendar .rbc-off-range-bg {
          background-color: #F8FAFC;
        }
        .brandforge-calendar .rbc-today {
          background-color: #F5F3FF;
        }
        .brandforge-calendar .rbc-event {
          margin-top: 2px;
        }
        .brandforge-calendar .rbc-month-event {
            padding: 4px 8px;
        }
      `}} />
        </div>
    );
};
