ALTER TABLE public.social_connections ADD COLUMN IF NOT EXISTS access_token TEXT;
ALTER TABLE public.social_connections ADD COLUMN IF NOT EXISTS meta_page_id TEXT;
ALTER TABLE public.social_connections ADD COLUMN IF NOT EXISTS instagram_business_id TEXT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM   pg_constraint
        WHERE  conname = 'social_connections_workspace_platform_key'
    ) THEN
        ALTER TABLE public.social_connections ADD CONSTRAINT social_connections_workspace_platform_key UNIQUE (workspace_id, platform);
    END IF;
END $$;
