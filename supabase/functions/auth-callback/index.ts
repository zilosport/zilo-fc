import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const url = new URL(req.url)
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")

  // إذا لم نجد كود، سنقوم بطباعة كل شيء بوضوح في الـ Logs
  if (!code) {
    console.log("Request URL:", req.url);
    console.log("Search Params:", Object.fromEntries(url.searchParams.entries()));
    
    return new Response(JSON.stringify({ 
      message: "لم نستلم كود من تويتر. تحقق من إعدادات الـ Redirect URI في منصة مطوري تويتر.",
      url_debug: req.url 
    }), { status: 400, headers: { "Content-Type": "application/json" } })
  }

  // إذا وصلنا هنا، يعني أن الكود وصل بنجاح
  return new Response("تم استلام الكود بنجاح: " + code, { status: 200 })
})
