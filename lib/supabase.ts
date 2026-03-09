import { createClient } from "@supabase/supabase-js";

export const supaBase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
)