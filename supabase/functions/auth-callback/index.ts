import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const TWITTER_CLIENT_ID = Deno.env.get("TWITTER_CLIENT_ID")
const TWITTER_CLIENT_SECRET = Deno.env.get("TWITTER_CLIENT_SECRET")

serve(async (req) => {
  const url = new URL(req.url)
  const code = url.searchParams.get("code")
  const telegramId = url.searchParams.get("state") // هذا هو معرف التليجرام الذي أرسلناه سابقاً

  if (!code) {
    return new Response(JSON.stringify({ error: "No code provided" }), { status: 400 })
  }

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
        code_verifier: "challenge" // يجب أن يطابق ما أرسلناه في الرابط
      })
    })

    const tokenData = await response.json()
    if (!tokenData.access_token) {
        return new Response(JSON.stringify({ error: "Failed to get access token", details: tokenData }), { status: 400 })
    }
    
    // 2. جلب بيانات المستخدم
    const userRes = await fetch("https://api.twitter.com/2/users/me", {
      headers: { "Authorization": `Bearer ${tokenData.access_token}` }
    })
    const userData = await userRes.json()

    // 3. حفظ البيانات في قاعدة بيانات Supabase باستخدام معرف التليجرام
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    await supabase.from("users").update({ 
      twitter_user_id: userData.data.id,
      twitter_username: userData.data.username 
    }).eq("telegram_id", telegramId)

    // إغلاق نافذة المتصفح برسالة نجاح
    return new Response("<html><body><h1>تم الربط بنجاح! يمكنك إغلاق هذه الصفحة والعودة للتطبيق.</h1></body></html>", {
      headers: { "Content-Type": "text/html" }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
