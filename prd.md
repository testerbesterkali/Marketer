**PRODUCT REQUIREMENTS DOCUMENT**

**BrandForge AI**

AI-Powered Brand Identity & Content Automation Platform

**Version:** 1.0 **Stack:** React + Vite + Supabase **APIs:** OpenAI + Pollinations.ai

**1. Product Overview**

BrandForge AI is a web application that transforms a business\'s website URL into a fully fledged brand identity profile and automated content calendar. Within minutes of entering a URL, users receive AI-extracted brand assets, a personalized content strategy, and 10 auto-generated posts ready for approval --- across Instagram, Facebook, LinkedIn, X, TikTok, and more.

This PRD covers architecture, user flows, database schema, API integrations, component breakdowns, and non-functional requirements for a production-grade deployment on React + Vite (frontend) and Supabase (backend/auth/database/storage).

**2. Goals & Success Metrics**

**2.1 Primary Goals**

-   Reduce brand setup time from days to under 5 minutes via AI automation

-   Deliver a delightful, opinionated onboarding flow with zero configuration friction

-   Generate production-ready social media content tailored to the user\'s brand voice

-   Drive conversion from free trial (10 posts) to paid subscription

**2.2 Key Success Metrics**

  ---------------------------- ---------------------- ---------------------------------------
  **Metric**                   **Target**             **Measurement**

  Onboarding Completion Rate   \> 70%                 URL input → Dashboard reached

  Brand Profile Accuracy       \> 80% user approval   \% who click Looks Good without edits

  Time to First Post           \< 3 minutes           URL input → Calendar populated

  Free-to-Paid Conversion      \> 15%                 Trial users upgrading within 14 days

  Post Approval Rate           \> 65%                 Posts approved without edits
  ---------------------------- ---------------------- ---------------------------------------

**3. Technology Stack**

**3.1 Frontend**

-   **Framework:** React 18 + Vite 5

-   **Routing:** React Router v6 for client-side routing with protected route guards

-   **State Management:** Zustand for global state (user session, brand profile, onboarding step)

-   **Data Fetching:** TanStack Query (React Query) for server state, caching, and background refetching

-   **Styling:** Tailwind CSS + shadcn/ui for component library

-   **Animations:** Framer Motion for page transitions and micro-animations

-   **UI Libraries:** react-colorful for brand color palette display

-   **Calendar:** date-fns + react-big-calendar for the content calendar view

-   **File Upload:** react-dropzone for image uploads to Supabase Storage

**3.2 Backend (Supabase)**

-   **Authentication:** Supabase Auth --- Email/password + Google OAuth via Supabase Auth Helpers for React

-   **Database:** Supabase Postgres --- Primary relational database for all app data

-   **Edge Functions:** Supabase Edge Functions (Deno) --- Server-side AI orchestration, OpenAI calls, brand scraping

-   **File Storage:** Supabase Storage --- Brand logos, uploaded images, generated media assets

-   **Realtime:** Supabase Realtime --- Live content generation progress updates to the dashboard

-   **Security:** Supabase Row Level Security (RLS) --- All tables protected, users only access their own data

**3.3 External APIs**

-   **OpenAI:** OpenAI GPT-4o --- Website content analysis, brand profile generation, post copy writing

-   **OpenAI Vision:** OpenAI Vision API --- Logo and visual asset analysis from scraped pages

-   **Pollinations.ai:** Pollinations.ai --- Free image generation for social media posts and ad creatives

-   **Web Scraping:** Jina AI Reader (jina.ai/r/) --- URL-to-markdown conversion for clean website text extraction (free tier)

**4. Database Schema (Supabase Postgres)**

All tables use UUID primary keys, include created_at and updated_at timestamps, and enforce RLS policies tying rows to the authenticated user\'s ID (auth.uid()).

**4.1 Core Tables**

**users_profile**

Extends Supabase auth.users. Created via a trigger on signup.

  ---------------------- -------------------------- ----------------------------------
  **Column**             **Type**                   **Description**

  id                     uuid (PK, FK auth.users)   Links to Supabase auth user

  full_name              text                       Display name

  avatar_url             text                       Profile photo URL

  plan                   text DEFAULT \'free\'      free \| starter \| pro \| agency

  credits_remaining      integer DEFAULT 200        Weekly AI generation credits

  trial_ends_at          timestamptz                Trial expiry timestamp

  onboarding_completed   boolean DEFAULT false      Whether full onboarding is done
  ---------------------- -------------------------- ----------------------------------

**workspaces**

A user can have multiple brand workspaces (one per brand/client).

  --------------------- ------------------------- -----------------------------------
  **Column**            **Type**                  **Description**

  id                    uuid (PK)                 

  owner_id              uuid (FK users_profile)   RLS anchor

  name                  text                      Workspace display name

  website_url           text                      The URL used for brand extraction

  onboarding_step       integer DEFAULT 0         Current onboarding step (0-5)
  --------------------- ------------------------- -----------------------------------

**brand_profiles**

Stores the AI-extracted and user-edited brand identity. One per workspace.

  ----------------------- ---------------------- ----------------------------------------------------
  **Column**              **Type**               **Description**

  id                      uuid (PK)              

  workspace_id            uuid (FK workspaces)   

  business_name           text                   

  tagline                 text                   

  industry                text                   

  target_audience         text                   

  brand_voice             text                   e.g. Professional, Witty, Inspiring

  core_values             text\[\]               Array of brand value strings

  unique_selling_points   text\[\]               

  competitors             text\[\]               Auto-detected competitor names

  brand_story             text                   Full brand narrative

  mission_statement       text                   

  archetype               text                   e.g. The Innovator, The Hero

  emotional_benefits      jsonb                  Object with benefit categories

  color_palette           jsonb                  { primary, secondary, accent, background, text }

  typography              jsonb                  { heading_font, body_font, sizes }

  logo_url                text                   Extracted or uploaded logo URL in Supabase Storage

  raw_scraped_data        text                   Original markdown from Jina AI scrape

  ai_confidence_score     float                  0-1 confidence from GPT analysis
  ----------------------- ---------------------- ----------------------------------------------------

**style_preferences**

The visual style templates the user selected during onboarding (Step 3).

  --------------------- ---------------------- --------------------------------------------------
  **Column**            **Type**               **Description**

  id                    uuid (PK)              

  workspace_id          uuid (FK workspaces)   

  selected_styles       text\[\]               e.g. \[\'minimalist\', \'bold\', \'editorial\'\]

  color_mood            text                   e.g. \'warm\', \'cool\', \'monochrome\'

  layout_preference     text                   e.g. \'text-heavy\', \'image-led\', \'mixed\'

  sample_post_ids       uuid\[\]               Reference to approved style sample posts
  --------------------- ---------------------- --------------------------------------------------

**content_plans**

The user\'s configured posting strategy per workspace.

  ---------------------- ---------------------- ----------------------------------------------------------------------------
  **Column**             **Type**               **Description**

  id                     uuid (PK)              

  workspace_id           uuid (FK workspaces)   

  platforms              jsonb                  { instagram: bool, facebook: bool, linkedin: bool, x: bool, tiktok: bool }

  posts_per_week         jsonb                  { social: int, video: int, blog: int, email: int }

  paid_ads_enabled       boolean                

  weekly_ad_budget_usd   numeric                

  blog_platform          text                   e.g. WordPress, Webflow, None

  email_platform         text                   e.g. Mailchimp, None

  active                 boolean DEFAULT true   
  ---------------------- ---------------------- ----------------------------------------------------------------------------

**posts**

Individual content pieces generated or created by the user.

  --------------------- ----------------------------- ---------------------------------------------------------------------
  **Column**            **Type**                      **Description**

  id                    uuid (PK)                     

  workspace_id          uuid (FK workspaces)          

  platform              text                          instagram \| facebook \| linkedin \| x \| tiktok \| blog \| email

  post_type             text                          post \| reel \| story \| ad \| email \| blog

  status                text DEFAULT \'generating\'   generating \| draft \| approved \| scheduled \| published \| failed

  caption               text                          AI-generated or user-edited caption

  hashtags              text\[\]                      

  image_url             text                          Pollinations.ai generated image stored in Supabase Storage

  image_prompt          text                          The prompt used to generate the image

  scheduled_at          timestamptz                   When to publish

  published_at          timestamptz                   Actual publish time

  credits_used          integer                       Credits consumed for generation

  generation_batch_id   uuid                          Groups posts from same generation run

  topic_id              uuid (FK topics)              Source topic
  --------------------- ----------------------------- ---------------------------------------------------------------------

**topics**

Content topics/ideas generated by AI for the user to approve or edit.

  --------------------- ----------------------- ---------------------------------------------
  **Column**            **Type**                **Description**

  id                    uuid (PK)               

  workspace_id          uuid (FK workspaces)    

  title                 text                    

  description           text                    

  content_pillar        text                    e.g. Educational, Promotional, Entertaining

  suggested_platforms   text\[\]                

  approved              boolean DEFAULT false   

  week_of               date                    The week this topic is planned for
  --------------------- ----------------------- ---------------------------------------------

**social_connections**

  --------------------- ---------------------- -------------------------------------
  **Column**            **Type**               **Description**

  id                    uuid (PK)              

  workspace_id          uuid (FK workspaces)   

  platform              text                   

  access_token          text (encrypted)       Stored encrypted via Supabase Vault

  refresh_token         text (encrypted)       

  expires_at            timestamptz            

  account_name          text                   

  account_id            text                   

  connected             boolean                
  --------------------- ---------------------- -------------------------------------

**5. Onboarding Flow --- Step by Step**

The onboarding is a linear, multi-step wizard. Progress is persisted to the workspaces.onboarding_step column so users can resume if they close the tab. Each step is a separate route.

**Step 0 --- Auth Gate (/login, /signup)**

-   Email + password signup OR Google OAuth via Supabase Auth

-   On success: create users_profile row (via database trigger) and redirect to /onboarding/start

-   If user already has a workspace with onboarding_completed = true, redirect to /dashboard

**Step 1 --- URL Input (/onboarding/start)**

-   Single input: website URL with language selector (English US default)

-   Validation: must be a valid URL format before enabling the CTA button

-   On submit: create a new workspace record with the URL and advance to step 2

-   Alternatively, a \'Set up manually\' link skips to Step 2 with empty brand profile

**Step 2 --- Brand Extraction Loading (/onboarding/analyzing)**

This is an async processing step. On mount, trigger a Supabase Edge Function called analyze-brand. The flow:

-   Call Jina AI Reader API: GET https://r.jina.ai/{website_url} to retrieve clean markdown of the entire site

-   Send the markdown to OpenAI GPT-4o with a structured JSON prompt to extract: business_name, tagline, industry, target_audience, brand_voice, core_values, unique_selling_points, competitors, brand_story, mission_statement, archetype, emotional_benefits, color_palette, typography, and logo_url

-   Store result in brand_profiles table linked to the workspace

-   Subscribe to Supabase Realtime channel workspace:{id} to stream progress back to the UI

-   UI shows three sequential loading states: Analyzing your website → Locating business → Looking for competitors

-   Right panel shows a static instructional card: what to check, need to edit, why this matters

-   On completion (realtime event received), auto-advance to Step 3

**Step 3 --- Brand Profile Review (/onboarding/review)**

-   Display full AI-extracted brand profile in a clean scrollable document layout

-   Every section (Core Identity, Value Proposition, Emotional Benefits, Brand Story, Brand Personality) has an inline Edit button

-   Clicking Edit opens an inline rich text editor or form fields for that section --- saves on blur/confirm

-   Right panel persists with Review your Brand Profile guidance

-   CTA: Looks Good button advances to Step 4

**Step 4 --- Style Selection (/onboarding/style)**

-   Show 6-8 visual style tiles, each a generated sample post image (generated via Pollinations.ai using the brand\'s color palette and a style seed)

-   Styles include: Minimalist, Bold & Vibrant, Editorial, Corporate Clean, Playful, Dark Luxury, Warm Earthy, Neon Futuristic

-   User can multi-select up to 3 styles --- selected tiles get a checkmark overlay

-   Save selections to style_preferences table and advance to Step 5

**Step 5 --- Content Plan Setup (/onboarding/plan)**

-   Grouped by content type: Social Media, Short-form Video, Paid Ads, Blog, Email

-   For each group: checkboxes for individual platforms and a posts/week stepper (+/-) control

-   Social media posts cost \~3 credits each, short-form video \~18 credits, blog \~9 credits, email \~3 credits

-   Free plan includes 200 credits/week --- running total shown at top

-   Paid Ads section: checkbox for Meta + weekly budget USD input

-   Blog and Email sections: dropdown to connect platform (WordPress, Webflow, Mailchimp, etc.) or select \'I don\'t want X\'

-   CTA: Next, review topics → triggers topic generation and advances to Step 6 loading screen

**Step 6 --- Topic Generation Loading (/onboarding/generating)**

-   Fullscreen centered loading state with three steps: Analyzing ideas → Generating topics → Finishing up

-   Supabase Edge Function generate-topics uses the brand_profile + content_plan to generate 20-30 topic ideas via OpenAI

-   Topics stored in topics table with content_pillar classifications

-   Simultaneously triggers generate-initial-posts Edge Function which creates the first 10 posts in \'generating\' status

-   Each post generation: prompt OpenAI for caption + hashtags, prompt Pollinations.ai for image, store in posts table

-   On completion, set workspaces.onboarding_completed = true and redirect to /dashboard

**6. Main Application --- Dashboard & Screens**

**6.1 Layout**

-   Persistent left sidebar with: workspace switcher at top, navigation links (Home, Calendar, Approvals, Content Plan, Paid Ads, Insights, Brand Kit, Content Preferences, Integrations), Files & Projects section below, utility links at bottom (Refer & Earn, Join Community, Invite Team Members, Help & Learn)

-   Top bar: breadcrumb / page title, date range / view controls (context-dependent), trial status badge + Upgrade CTA, user avatar

-   Main content area takes remaining space

**6.2 Home Screen (/dashboard)**

-   Overview cards: weekly credits used, posts scheduled, posts published, top performing post

-   Quick Actions: Create Post, Schedule Week, Connect Accounts

-   Recent Posts section: last 5 generated/scheduled posts with status chips

-   Upcoming schedule: mini 7-day view showing what\'s queued

**6.3 Calendar Screen (/dashboard/calendar) --- Default Landing**

-   The primary screen users land on after onboarding

-   View toggles: Day, 3-Day, Week, Month (default: 5-day view matching the screenshots)

-   Each post appears as a card on its scheduled date/time showing: platform icons, post type badge (Post/Reel/Story/Ad), time, and a blurred preview of the generated image

-   Cards in \'generating\' state show a soft orange/salmon shimmer skeleton animation

-   A bottom toast notification appears while posts are still generating: \'Don\'t let your new content sit idle --- Connect your socials now so Blaze can post it the moment it\'s ready\' with a Connect accounts CTA and progress bar (e.g. Generating content\...0/8 completed, Estimated time: 1 minute)

-   Clicking a post card opens a slide-over panel with full post preview, caption editor, hashtag editor, reschedule control, platform selector, and Approve / Request Changes buttons

**6.4 Approvals Screen (/dashboard/approvals)**

-   Grid of all posts in draft or pending state requiring human review

-   Bulk approve, bulk reject, or open individual post for editing

-   Filter by platform, post type, date range

**6.5 Brand Kit Screen (/dashboard/brand-kit)**

-   Displays extracted brand assets: logo (with download), color swatches (hex codes, copy on click), typography specimens, brand voice descriptor, archetype card

-   Edit any asset inline --- changes propagate to future post generation

**6.6 Content Plan Screen (/dashboard/content-plan)**

-   Editable version of the Step 5 configuration

-   Shows current credit usage forecast vs remaining credits

-   Add or remove platforms, change post frequency

**6.7 Insights Screen (/dashboard/insights)**

-   Post performance metrics (connected platform data)

-   Impressions, engagement rate, follower growth charts per platform

-   Top performing posts grid

**6.8 Integrations Screen (/dashboard/integrations)**

-   OAuth connect flows for: Instagram Business, Facebook Page, LinkedIn Company, X (Twitter), TikTok Business, Mailchimp, WordPress

-   Connected accounts show status chip, account name, disconnect option

-   Disconnected accounts show Connect button which initiates OAuth popup flow

**7. Supabase Edge Functions**

All AI-heavy work runs in Supabase Edge Functions (Deno TypeScript) to keep API keys server-side and avoid CORS issues. Each function requires a valid JWT in the Authorization header.

**7.1 analyze-brand**

-   Input: workspace_id, website_url

-   Fetch website markdown via Jina AI Reader

-   Send markdown to OpenAI GPT-4o with a structured JSON schema prompt --- response_format: json_object

-   Parse response, upsert into brand_profiles table

-   Broadcast progress events to Supabase Realtime channel workspace:{workspace_id}

-   Return: brand_profile_id on success

**7.2 generate-topics**

-   Input: workspace_id

-   Fetch brand_profile + content_plan for the workspace

-   Call OpenAI with brand context to produce 20-30 content topic objects (title, description, content_pillar, suggested_platforms)

-   Batch insert into topics table

-   Return: topic count

**7.3 generate-initial-posts**

-   Input: workspace_id, batch_size (default: 10)

-   Fetch approved topics (or auto-approve first N for free trial)

-   For each post to generate: build OpenAI prompt from brand_profile + style_preferences + topic → get caption + hashtags, then call Pollinations.ai text-to-image API with brand-aware image prompt

-   Download generated image, upload to Supabase Storage at posts/{workspace_id}/{post_id}.png

-   Insert post record with status=\'draft\', scheduled_at set to next available slot per content_plan

-   Broadcast progress events: { generated: N, total: batch_size }

**7.4 generate-post (on-demand)**

-   Input: workspace_id, topic_id, platform, post_type

-   Same logic as generate-initial-posts but for a single post

-   Returns post_id

**7.5 schedule-post**

-   Input: post_id, scheduled_at

-   Validates the post is approved and the workspace has a connected account for the platform

-   Updates posts.scheduled_at and posts.status = \'scheduled\'

-   A separate Supabase scheduled trigger (pg_cron) runs every minute to publish due posts via platform APIs

**8. Frontend Component Architecture**

**8.1 Route Structure**

-   /login --- AuthPage with login form

-   /signup --- AuthPage with signup form

-   /onboarding/start --- UrlInputScreen

-   /onboarding/analyzing --- BrandAnalyzingScreen

-   /onboarding/review --- BrandReviewScreen

-   /onboarding/style --- StyleSelectionScreen

-   /onboarding/plan --- ContentPlanScreen

-   /onboarding/generating --- TopicGeneratingScreen

-   /dashboard --- DashboardLayout wrapping child routes

-   /dashboard/calendar --- CalendarScreen (default)

-   /dashboard/approvals --- ApprovalsScreen

-   /dashboard/brand-kit --- BrandKitScreen

-   /dashboard/content-plan --- ContentPlanEditScreen

-   /dashboard/insights --- InsightsScreen

-   /dashboard/integrations --- IntegrationsScreen

**8.2 Key Shared Components**

-   AuthGuard --- HOC that checks Supabase session, redirects to /login if unauthenticated

-   OnboardingGuard --- Checks onboarding_step, redirects to correct onboarding screen if incomplete

-   WorkspaceProvider --- Zustand store provider that loads the active workspace on mount

-   PostCard --- Renders a post in calendar, approvals, or home views; accepts variant prop (calendar \| grid \| list)

-   PostSlideOver --- Full post editor panel, used from CalendarScreen and ApprovalsScreen

-   BrandColorSwatch --- Renders a color circle with hex code, copy-to-clipboard on click

-   PlatformIcon --- Renders the correct platform logo given a platform string

-   ProgressToast --- The bottom generation progress banner shown on CalendarScreen

-   CreditBadge --- Shows remaining credits, with warning color at \< 50 credits

**8.3 State Management (Zustand Stores)**

-   useAuthStore --- user session, user profile, plan, credits

-   useWorkspaceStore --- active workspace, brand profile, style preferences, content plan

-   usePostsStore --- cached posts, generation queue, approval counts

-   useOnboardingStore --- current step, transient form data between onboarding steps

**9. AI & Image Generation Details**

**9.1 OpenAI Integration**

**Model:** GPT-4o for brand analysis and post copy; GPT-4o-mini for topic generation (cost optimization)

**Brand Extraction Prompt:** Structured prompt with JSON schema output. Instructs the model to extract all brand profile fields from website markdown. Temperature: 0.3 for consistency.

**Post Copy Prompt:** Include brand_voice, platform, post_type, topic, core_values, target_audience. Request caption (platform-length-appropriate) + 5-10 relevant hashtags. Temperature: 0.7 for creativity.

**Token Budget:** Brand extraction: \~6000 tokens input / 2000 output. Post copy: \~800 tokens input / 400 output.

**9.2 Pollinations.ai Image Generation**

-   Endpoint: GET https://image.pollinations.ai/prompt/{encoded_prompt}

-   Parameters: width, height (platform-appropriate: 1080x1080 for Instagram square, 1080x1920 for Reels/Stories, 1200x628 for LinkedIn/Facebook), seed (deterministic per brand), model (flux is default high quality model)

-   Image prompt construction: combine style keywords from style_preferences + brand color descriptions + post topic + \'professional commercial photography style, brand marketing\' --- keep under 200 characters for best results

-   Downloaded and re-hosted in Supabase Storage for reliability and CDN delivery

-   Error handling: if Pollinations fails, retry once with a simpler prompt, then fall back to a solid color gradient image using brand colors

**9.3 Credit System**

  ------------------------- ------------------ ----------------------------------
  **Content Type**          **Credits/Post**   **Notes**

  Social Media Post         3                  Instagram, Facebook, LinkedIn, X

  Short-form Video Script   18                 TikTok, Reels, YouTube Shorts

  Blog Post                 9                  \~800-word draft

  Email                     3                  Subject + body

  Paid Ad Variant           3                  Per ad creative variant
  ------------------------- ------------------ ----------------------------------

**10. Auth, Security & RLS**

**10.1 Authentication**

-   Supabase Auth with email/password and Google provider

-   JWT stored in localStorage via Supabase client, auto-refreshed

-   Auth state managed via onAuthStateChange listener initialized in AuthProvider

-   Password reset flow via Supabase Magic Link email

**10.2 Row Level Security Policies**

-   users_profile: SELECT/UPDATE WHERE id = auth.uid()

-   workspaces: ALL WHERE owner_id = auth.uid()

-   brand_profiles: ALL WHERE workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())

-   posts: ALL WHERE workspace_id IN (same subquery)

-   All other tables follow the same workspace-scoped RLS pattern

**10.3 API Key Security**

-   OpenAI and Pollinations keys stored ONLY in Supabase Edge Function secrets (via supabase secrets set)

-   Never exposed to the frontend --- all AI calls go through Edge Functions

-   Social OAuth tokens stored encrypted in Supabase Vault

**11. Realtime & User Notifications**

-   Supabase Realtime channels used for: brand analysis progress (Step 2), post generation progress (Step 6 + Dashboard)

-   Channel naming: workspace:{workspace_id} --- subscribe on component mount, unsubscribe on unmount

-   Progress payload shape: { event: \'progress\', step: string, percent: number, data?: any }

-   Generation completion triggers automatic React Query cache invalidation to refresh the calendar view

-   In-app toast notifications for: post approved, post published, credits running low, new week\'s posts ready

**12. Supabase Storage Structure**

  ---------------- ---------------------------------------- ----------------------------------
  **Bucket**       **Path Pattern**                         **Access**

  brand-assets     /{workspace_id}/logo.png, /colors.json   Private (authenticated)

  post-images      /{workspace_id}/{post_id}.png            Private (authenticated)

  user-uploads     /{user_id}/profile.jpg                   Private (authenticated)

  style-samples    /samples/{style_name}.png                Public (onboarding style picker)
  ---------------- ---------------------------------------- ----------------------------------

**13. Deployment & Infrastructure**

**13.1 Frontend Deployment**

-   Build: npm run build (Vite output to /dist)

-   Host: Vercel or Cloudflare Pages --- connect GitHub repo for CI/CD

-   Environment variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (public, safe for frontend)

-   Domain: custom domain with SSL via Vercel/Cloudflare

**13.2 Supabase Project Setup**

-   Create a new Supabase project, enable the following extensions: uuid-ossp, pg_cron, pgcrypto (for token encryption via Vault)

-   Run all SQL migrations via Supabase CLI: supabase db push

-   Deploy Edge Functions: supabase functions deploy (all functions in /supabase/functions/)

-   Set secrets: supabase secrets set OPENAI_API_KEY=\... JINA_API_KEY=\...

-   Configure Auth: enable Email provider, enable Google OAuth (add Client ID + Secret from Google Cloud Console), set redirect URLs

-   Set up Storage buckets with appropriate RLS policies

-   Enable Supabase Realtime for the posts and topics tables

**13.3 Environment Variables**

  --------------------------- ----------------------- ---------------------------------------
  **Variable**                **Location**            **Purpose**

  VITE_SUPABASE_URL           Frontend (.env)         Supabase project URL

  VITE_SUPABASE_ANON_KEY      Frontend (.env)         Public anon key for Supabase client

  OPENAI_API_KEY              Edge Function secrets   GPT-4o calls

  JINA_API_KEY                Edge Function secrets   Web scraping via r.jina.ai

  SUPABASE_SERVICE_ROLE_KEY   Edge Function secrets   Admin DB operations in Edge Functions
  --------------------------- ----------------------- ---------------------------------------

**14. Development Phases**

  --------------------------------------- ----------------------------------------------------------------------------------- -------------------
  **Phase**                               **Scope**                                                                           **Est. Duration**

  Phase 1 --- Foundation                  Auth, Supabase setup, DB schema, base layout components, routing                    1 week

  Phase 2 --- Onboarding Steps 1-3        URL input, brand analysis Edge Function, brand review screen                        1.5 weeks

  Phase 3 --- Onboarding Steps 4-6        Style picker, content plan, topic + post generation, Pollinations.ai integration    1.5 weeks

  Phase 4 --- Calendar Dashboard          Calendar view, post cards, skeleton loading, progress toast, Realtime integration   1 week

  Phase 5 --- Post Management             Post slide-over editor, approvals screen, bulk actions                              1 week

  Phase 6 --- Brand Kit + Insights        Brand Kit screen, Insights charts (recharts), connected platform data               1 week

  Phase 7 --- Integrations + Scheduling   OAuth connect flows, post scheduler pg_cron job, publish to platforms               1.5 weeks

  Phase 8 --- Polish + Launch             Animations, error states, onboarding polish, performance, SEO, beta testing         1 week
  --------------------------------------- ----------------------------------------------------------------------------------- -------------------

**15. Non-Functional Requirements**

**Performance**

-   Initial page load (LCP): \< 2.5 seconds on 4G

-   Time-to-interactive: \< 4 seconds

-   Brand extraction Edge Function: \< 30 seconds end-to-end

-   Image generation per post: \< 10 seconds

-   Calendar render with 50+ posts: \< 200ms

**Accessibility**

-   WCAG 2.1 AA compliance

-   Full keyboard navigation for all interactive elements

-   Screen reader labels on all icon buttons and form inputs

-   Minimum 4.5:1 color contrast ratio for text

**Error Handling**

-   Jina AI scrape failure: prompt user to paste homepage text manually

-   OpenAI timeout/error: show retry button, cache partial results

-   Pollinations.ai failure: fallback to brand-color gradient image

-   Supabase connection lost: show offline banner, queue writes, sync on reconnect

**Appendix --- Key API References**

-   Jina AI Reader: https://r.jina.ai/{url} --- returns clean markdown, no API key required for basic usage

-   Pollinations.ai Image: https://image.pollinations.ai/prompt/{prompt}?width=1080&height=1080&model=flux

-   OpenAI Chat Completions: https://api.openai.com/v1/chat/completions --- use response_format: { type: \'json_object\' } for structured outputs

-   Supabase JS Client: \@supabase/supabase-js --- use createClient(url, anonKey) in frontend, createClient(url, serviceKey) in Edge Functions

-   Supabase Realtime: client.channel(\'workspace:\' + id).on(\'broadcast\', { event: \'progress\' }, callback).subscribe()

*--- End of Document ---*