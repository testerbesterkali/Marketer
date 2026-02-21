#!/bin/bash
npx supabase migration repair --status reverted 20260221032452
npx supabase migration repair --status reverted 20260221035508
npx supabase migration repair --status reverted 20260221035514
npx supabase migration repair --status reverted 20260221035556
npx supabase migration repair --status applied 20240221000000
npx supabase migration new add_oauth_columns
