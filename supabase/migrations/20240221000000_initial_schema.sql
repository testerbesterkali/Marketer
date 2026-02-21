-- 1. Create users_profile table
CREATE TABLE IF NOT EXISTS public.users_profile (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    plan TEXT DEFAULT 'free',
    credits_remaining INTEGER DEFAULT 200,
    trial_ends_at TIMESTAMPTZ,
    onboarding_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create workspaces table
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.users_profile(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    website_url TEXT,
    onboarding_step INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create brand_profiles table
CREATE TABLE IF NOT EXISTS public.brand_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    business_name TEXT,
    tagline TEXT,
    industry TEXT,
    target_audience TEXT,
    brand_voice TEXT,
    core_values TEXT[],
    unique_selling_points TEXT[],
    competitors TEXT[],
    brand_story TEXT,
    mission_statement TEXT,
    archetype TEXT,
    emotional_benefits JSONB,
    color_palette JSONB,
    typography JSONB,
    logo_url TEXT,
    raw_scraped_data TEXT,
    ai_confidence_score FLOAT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create style_preferences table
CREATE TABLE IF NOT EXISTS public.style_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    selected_styles TEXT[],
    color_mood TEXT,
    layout_preference TEXT,
    sample_post_ids UUID[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create content_plans table
CREATE TABLE IF NOT EXISTS public.content_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    platforms JSONB,
    posts_per_week JSONB,
    paid_ads_enabled BOOLEAN DEFAULT false,
    weekly_ad_budget_usd NUMERIC,
    blog_platform TEXT,
    email_platform TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create topics table
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    content_pillar TEXT,
    suggested_platforms TEXT[],
    approved BOOLEAN DEFAULT false,
    week_of DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create posts table
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    platform TEXT,
    post_type TEXT,
    status TEXT DEFAULT 'generating',
    caption TEXT,
    hashtags TEXT[],
    image_url TEXT,
    image_prompt TEXT,
    scheduled_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    credits_used INTEGER,
    generation_batch_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Create social_connections table
CREATE TABLE IF NOT EXISTS public.social_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    account_name TEXT,
    account_id TEXT,
    connected BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.style_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_connections ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own profile" ON public.users_profile FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users_profile FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view their own workspaces" ON public.workspaces FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "Users can insert their own workspaces" ON public.workspaces FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can update their own workspaces" ON public.workspaces FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can manage brand_profiles via workspace" ON public.brand_profiles 
FOR ALL USING (workspace_id IN (SELECT id FROM public.workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Users can manage style_preferences via workspace" ON public.style_preferences 
FOR ALL USING (workspace_id IN (SELECT id FROM public.workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Users can manage content_plans via workspace" ON public.content_plans 
FOR ALL USING (workspace_id IN (SELECT id FROM public.workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Users can manage topics via workspace" ON public.topics 
FOR ALL USING (workspace_id IN (SELECT id FROM public.workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Users can manage posts via workspace" ON public.posts 
FOR ALL USING (workspace_id IN (SELECT id FROM public.workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Users can manage social_connections via workspace" ON public.social_connections 
FOR ALL USING (workspace_id IN (SELECT id FROM public.workspaces WHERE owner_id = auth.uid()));

-- Triggers for users_profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users_profile (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
