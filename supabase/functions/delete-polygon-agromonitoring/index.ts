// Archivo: supabase/functions/delete-polygon-agromonitoring/index.ts
// v1.1 - Corrige el typo en la URL de importación

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts' // <-- CORREGIDO
import { corsHeaders } from '../_shared/cors.ts'

const AGRO_API_URL = 'http://api.agromonitoring.com/agro/1.0'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { agromonitoring_id } = body
    if (!agromonitoring_id) {
      throw new Error('No se proporcionó agromonitoring_id.')
    }

    const apiKey = Deno.env.get('AGROMONITORING_API_KEY')
    if (!apiKey) {
      throw new Error('No se encontró el Secret AGROMONITORING_API_KEY.')
    }

    console.log(`Solicitud para borrar el polígono: ${agromonitoring_id}`)

    const response = await fetch(`${AGRO_API_URL}/polygons/${agromonitoring_id}?appid=${apiKey}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      // Si da "Not Found" (404), no importa, ya no existe.
      if (response.status !== 404) {
        console.error('Error de API Agromonitoring:', await response.text())
      }
    }

    console.log(`Polígono ${agromonitoring_id} borrado (o no encontrado) en Agromonitoring.`)

    return new Response(JSON.stringify({ success: true, id: agromonitoring_id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error fatal al borrar polígono:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
