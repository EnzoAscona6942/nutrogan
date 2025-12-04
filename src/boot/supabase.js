
import { createClient } from '@supabase/supabase-js'
import { boot } from 'quasar/wrappers'


const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_KEY


export const supabase = createClient(supabaseUrl, supabaseKey)

export default boot(({ app }) => {
  app.config.globalProperties.$supabase = supabase
})




