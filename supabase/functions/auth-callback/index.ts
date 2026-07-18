import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const url = new URL(req.url)
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")

  // 🔍 فحص حي للبيانات المستلمة
  if (!code) {
    return new Response(JSON.stringify({ 
      error: "لم يتم استلام كود من تويتر",
      received_url: req.url,
      params_found: Object.fromEntries(url.searchParams.entries()) 
    }), { 
      status: 400,
      headers: { "Content-Type": "application/json" }
    })
  }

  const TWITTER_CLIENT_ID = Deno.env.get("TWITTER_CLIENT_ID")
  const TWITTER_CLIENT_SECRET = Deno.env.get("TWITTER_CLIENT_SECRET")
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

  try {
    // 1. استبدال الكود بـ Access Token
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
    if (!tokenData.access_token) {
      throw new Error("تويتر لم يرسل التوكين: " + JSON.stringify(tokenData))
    }
    
    // 2. جلب بيانات المستخدم
    const userRes = await fetch("https://api.twitter.com/2/users/me", {
      headers: { "Authorization": `Bearer ${tokenData.access_token}` }
    })
    const userData = await userRes.json()

    if (!userData.data) {
      throw new Error("تعذر جلب بيانات المستخدم: " + JSON.stringify(userData))
    }

    // 3. التحديث في Supabase
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    const { error: updateError } = await supabase
      .from("users")
      .update({ 
        twitter_user_id: userData.data.id,
        twitter_username: userData.data.username 
      })
      .eq("telegram_id", state)

    if (updateError) throw updateError

    return new Response("<html><body style='font-family:sans-serif; text-align:center; padding-top:50px;'><h1>✅ تم ربط حساب X بنجاح!</h1><p>يمكنك العودة الآن إلى تطبيق تليجرام.</p></body></html>", {
      headers: { "Content-Type": "text/html" }
    })

  } catch (error) {
    console.error("Error details:", error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
