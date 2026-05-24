import { createClient }
from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL =
  'https://romihmdejcbjruaczpyx.supabase.co';

const SUPABASE_ANON_KEY =
  'sb_publishable_oASKgoKinb8jcY0C_ntp7Q_gFzKQWsv';

export const supabase =
  createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );