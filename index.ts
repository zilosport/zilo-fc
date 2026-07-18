import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const TWITTER_CLIENT_ID = Deno.env.get("TWITTER_CLIENT_ID")
const TWITTER_CLIENT_SECRET = Deno.env.get("TWITTER_CLIENT_SECRET")

serve(async (req) => {
  const url = new URL(req.url)
  const code = url.searchParams.get("code") // هذا الكود ترسله منصة X لنا

  // 1. استبدال الكود بـ Access Token
  const response = await fetch("https://api.twitter.com/2/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": "Basic " + btoa(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`)
    },
    body: new URLSearchParams({
      code: code!,
      grant_type: "authorization_code",
      redirect_uri: "https://ttyfcwtlasvphkariqhw.supabase.co/functions/v1/auth-callback"
    })
  })

  const tokenData = await response.json()
  
  // 2. جلب بيانات المستخدم (Twitter ID)
  const userRes = await fetch("https://api.twitter.com/2/users/me", {
    headers: { "Authorization": `Bearer ${tokenData.access_token}` }
  })
  const userData = await userRes.json()

  // 3. حفظ البيانات في قاعدة بيانات Supabase
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  await supabase.from("users").upsert({
    twitter_user_id: userData.data.id,
    twitter_username: userData.data.username
  })

  return new Response(JSON.stringify({ status: "success", username: userData.data.username }), {
    headers: { "Content-Type": "application/json" }
  })
})
