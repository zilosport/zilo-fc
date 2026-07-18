import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const url = new URL(req.url)
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state") 

  if (!code) {
    return new Response(JSON.stringify({ error: "لا يوجد كود" }), {
      status: 400,
      headers: new Headers({ "Content-Type": "application/json; charset=utf-8" })
    })
  }

  const TWITTER_CLIENT_ID = Deno.env.get("TWITTER_CLIENT_ID")
  const TWITTER_CLIENT_SECRET = Deno.env.get("TWITTER_CLIENT_SECRET")
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

  try {
    const response = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": "Basic " + btoa(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`)
      },
      body: new URLSearchParams({
        code: code,
        grant_type: "authorization_code",
        redirect_uri: "https://ttyfcwtlasvphkariqhw.supabase.co/functions/v1/auth-callback",
        code_verifier: "challenge"
      })
    })

    const tokenData = await response.json()
    
    const userRes = await fetch("https://api.twitter.com/2/users/me", {
      headers: { "Authorization": `Bearer ${tokenData.access_token}` }
    })
    const userData = await userRes.json()

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
    await supabase.from("users").update({ 
      twitter_user_id: userData.data.id,
      twitter_username: userData.data.username 
    }).eq("telegram_id", state)

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>نجاح الربط</title>
    </head>
    <body style="text-align:center; padding-top:50px; font-family:sans-serif;">
      <h1>🌟 تم ربط حساب X بنجاح يا خميس! 🌟</h1>
    </body>
    </html>
    `;

    // التعديل الحاسم هنا: إجبار السيرفر على قراءة الملف كـ HTML و UTF-8
    return new Response(htmlContent, {
      status: 200,
      headers: new Headers({
        "Content-Type": "text/html; charset=utf-8"
      })
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: new Headers({ "Content-Type": "application/json; charset=utf-8" })
    })
  }
})
