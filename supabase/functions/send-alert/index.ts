// Archivo: supabase/functions/send-alert/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// Clave de API de Resend (La configurarás en el Dashboard de Supabase > Edge Functions > Secrets)
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Manejo de CORS (para que tu app pueda llamar a la función)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { tipo, mensaje, destinatarios } = await req.json()

    if (!destinatarios || destinatarios.length === 0) {
      return new Response(JSON.stringify({ message: 'Sin destinatarios' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const resultados = []

    // 1. PROCESAR EMAILS (REAL con Resend)
    const emails = destinatarios.filter((d: any) => d.canal === 'email' && d.email)

    if (emails.length > 0 && RESEND_API_KEY) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Nutrogan Alertas <onboarding@resend.dev>', // Usa tu dominio si lo tienes, o el de prueba
          to: emails.map((e: any) => e.email),
          subject: `🚨 Alerta Nutrogan: ${tipo.toUpperCase()}`,
          html: `
            <div style="font-family: sans-serif; color: #333;">
              <h1 style="color: #39ff14; background: #000; padding: 10px;">Nutrogan Monitor</h1>
              <h2>Reporte de Evento: ${tipo}</h2>
              <p style="font-size: 16px;">${mensaje}</p>
              <hr>
              <p style="font-size: 12px; color: #666;">Este es un mensaje automático del sistema de gestión ganadera.</p>
            </div>
          `,
        }),
      })
      const data = await res.json()
      resultados.push({ canal: 'email', status: res.ok ? 'enviado' : 'error', data })
    }

    // 2. PROCESAR WHATSAPP (Estructura para Twilio)
    // Requiere TWILIO_ACCOUNT_SID y TWILIO_AUTH_TOKEN en Secrets
    /*
    const whatsapps = destinatarios.filter((d: any) => d.canal === 'whatsapp' && d.telefono)
    if (whatsapps.length > 0) {
       // Aquí iría la llamada a la API de Twilio
       // resultados.push({ canal: 'whatsapp', status: 'simulado (falta api key)' })
    }
    */

    return new Response(JSON.stringify({ success: true, resultados }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
