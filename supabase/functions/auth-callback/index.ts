import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  // 1. استخراج المعطيات من الرابط
  const url = new URL(req.url)
  const code = url.searchParams.get("code")
  const telegramId = url.searchParams.get("state")

  // التأكد من وجود المتغيرات الحساسة
  const TWITTER_CLIENT_ID = Deno.env.get("TWITTER_CLIENT_ID")
  const TWITTER_CLIENT_SECRET = Deno.env.get("TWITTER_CLIENT_SECRET")
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

  if (!code || !telegramId) {
    return new Response(JSON.stringify({ error: "Missing code or state" }), { status: 400 })
  }

  try {
    // 2. طلب التوكين من تويتر
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
    
    // 3. جلب بيانات المستخدم
    const userRes = await fetch("https://api.twitter.com/2/users/me", {
      headers: { "Authorization": `Bearer ${tokenData.access_token}` }
    })
    const userData = await userRes.json()

    if (!userData.data) {
      throw new Error("تعذر جلب بيانات المستخدم من تويتر")
    }

    // 4. التحديث في Supabase
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    const { error: updateError } = await supabase
      .from("users")
      .update({ 
        twitter_user_id: userData.data.id,
        twitter_username: userData.data.username 
      })
      .eq("telegram_id", telegramId)

    if (updateError) throw updateError

    // 5. صفحة النجاح
    return new Response("<html><body style='font-family:sans-serif; text-align:center; padding-top:50px;'><h1>✅ تم ربط حساب X بنجاح!</h1><p>يمكنك العودة الآن إلى تطبيق تليجرام.</p></body></html>", {
      headers: { "Content-Type": "text/html" }
    })

  } catch (error) {
    console.error("Error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
