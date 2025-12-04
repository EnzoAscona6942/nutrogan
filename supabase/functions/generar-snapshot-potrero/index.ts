// supabase/functions/generar-snapshot-potrero/index.ts
//
// --- VERSIÓN 2.0 ---
// - Calcula el Bounding Box (bbox) para mostrar el área circundante.
// - Genera una imagen rectangular (no solo el recorte) para llenar la tarjeta.
//

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// Script de True Color (sin cambios)
const evalscript_true_color = `
  //VERSION=3
  function setup() {
    return {
      input: ["B02", "B03", "B04", "dataMask"],
      output: { bands: 4 }
    };
  }
  function evaluatePixel(sample) {
    if (sample.dataMask == 0) {
      // Hacemos transparentes los píxeles fuera del polígono
      return [0, 0, 0, 0];
    }
    return [
      2.5 * sample.B04, // Rojo
      2.5 * sample.B03, // Verde
      2.5 * sample.B02, // Azul
      sample.dataMask // Usamos dataMask para la opacidad
    ];
  }
`

const SENTINEL_API_URL = 'https://services.sentinel-hub.com/api/v1/process'

// Función para obtener el token (sin cambios)
async function getSentinelToken(): Promise<string> {
  const clientId = Deno.env.get('SENTINEL_CLIENT_ID')
  const clientSecret = Deno.env.get('SENTINEL_CLIENT_SECRET')
  if (!clientId || !clientSecret) {
    throw new Error('Faltan las credenciales de Sentinel/Planet (CLIENT_ID o CLIENT_SECRET).')
  }
  const url = 'https://services.sentinel-hub.com/auth/realms/main/protocol/openid-connect/token'
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  })
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!response.ok)
    throw new Error('No se pudo obtener el token de SentinelHub: ' + (await response.text()))
  const data = await response.json()
  return data.access_token
}

// --- ¡NUEVA FUNCIÓN! ---
// Calcula el Bounding Box [minLng, minLat, maxLng, maxLat] de un polígono GeoJSON
function calculateBbox(geometry: any): number[] {
  let coords = geometry.coordinates[0]
  let minLng = coords[0][0]
  let minLat = coords[0][1]
  let maxLng = coords[0][0]
  let maxLat = coords[0][1]

  for (const coord of coords) {
    minLng = Math.min(minLng, coord[0])
    minLat = Math.min(minLat, coord[1])
    maxLng = Math.max(maxLng, coord[0])
    maxLat = Math.max(maxLat, coord[1])
  }
  return [minLng, minLat, maxLng, maxLat]
}

// --- ¡NUEVA FUNCIÓN! ---
// Valida el GeoJSON y lo estandariza
function validarGeoJson(geojson: any): any | null {
  let geoData = geojson
  if (typeof geoData === 'string') {
    try {
      geoData = JSON.parse(geoData)
    } catch (e) {
      return null
    }
  }
  if (geoData && geoData.type === 'Feature') {
    geoData = geoData.geometry
  }
  if (geoData && geoData.crs) {
    delete geoData.crs
  }
  if (geoData && geoData.type === 'Polygon') {
    return geoData
  }
  return null
}

// --- Función Principal (MODIFICADA) ---
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('PRIVATE_SUPABASE_SERVICE_KEY') ?? '',
    )

    const body = await req.json()
    const { potrero_id, geometria } = body
    if (!potrero_id) throw new Error('No se proporcionó potrero_id.')
    if (!geometria) throw new Error('No se proporcionó geometría.')

    console.log(`Generando snapshot v2 para potrero: ${potrero_id}`)

    const validGeoJson = validarGeoJson(geometria)
    if (!validGeoJson) throw new Error('GeoJSON inválido o no es un Polígono.')

    // --- ¡MODIFICACIÓN CLAVE! ---
    // 1. Calculamos el Bounding Box
    const bbox = calculateBbox(validGeoJson)

    // 2. Definimos una relación de aspecto para la tarjeta (ej. 16:9)
    const aspectRatio = 16 / 9
    const bboxWidth = bbox[2] - bbox[0]
    const bboxHeight = bbox[3] - bbox[1]

    // 3. Ajustamos el Bounding Box para que coincida con la relación de aspecto
    if (bboxWidth / bboxHeight > aspectRatio) {
      // El BBox es más ancho que la tarjeta, ajustamos el alto
      const newHeight = bboxWidth / aspectRatio
      const midLat = (bbox[1] + bbox[3]) / 2
      bbox[1] = midLat - newHeight / 2
      bbox[3] = midLat + newHeight / 2
    } else {
      // El BBox es más alto que la tarjeta, ajustamos el ancho
      const newWidth = bboxHeight * aspectRatio
      const midLng = (bbox[0] + bbox[2]) / 2
      bbox[0] = midLng - newWidth / 2
      bbox[2] = midLng + newWidth / 2
    }
    // --- FIN MODIFICACIÓN ---

    const sentinelToken = await getSentinelToken()

    const dateTo = new Date().toISOString()
    const dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const requestBody = {
      input: {
        bounds: {
          // Usamos el Bounding Box ajustado
          bbox: bbox,
        },
        data: [
          {
            type: 'sentinel-2-l2a',
            dataFilter: {
              timeRange: { from: dateFrom, to: dateTo },
              maxCloudCoverage: 20,
            },
            // ¡NUEVO! Le decimos que también procese el polígono
            // para que el evalscript pueda usar dataMask
            processing: {
              clip: {
                geometry: validGeoJson,
              },
            },
          },
        ],
      },
      output: {
        // Pedimos una imagen más ancha para la tarjeta
        width: 512,
        height: 288, // 512 / (16/9)
        responses: [{ identifier: 'default', format: { type: 'image/png' } }],
      },
      evalscript: evalscript_true_color,
    }

    // 1. Obtener la imagen PNG desde Sentinel-Hub
    const response = await fetch(SENTINEL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sentinelToken}`,
        Accept: 'image/png',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error(`Error en API Sentinel (No-OK): ${await response.text()}`)
    }

    const imageBlob = await response.blob()

    // 2. Subir la imagen a Supabase Storage (sin cambios)
    const filePath = `snapshot-${potrero_id}-${new Date().getTime()}.png`
    const { data: storageData, error: storageError } = await supabaseAdmin.storage
      .from('potrero-snapshots')
      .upload(filePath, imageBlob, {
        contentType: 'image/png',
        upsert: true,
      })

    if (storageError) throw storageError

    // 3. Obtener la URL pública (sin cambios)
    const { data: urlData } = supabaseAdmin.storage
      .from('potrero-snapshots')
      .getPublicUrl(storageData.path)

    const publicUrl = urlData.publicUrl

    // 4. Actualizar la tabla 'potreros' (sin cambios)
    const { error: updateError } = await supabaseAdmin
      .from('potreros')
      .update({ snapshot_url: publicUrl })
      .eq('id', potrero_id)

    if (updateError) throw updateError

    console.log(`Snapshot (v2) guardado en: ${publicUrl}`)

    return new Response(
      JSON.stringify({
        message: 'Snapshot v2 generado y guardado.',
        snapshot_url: publicUrl,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    )
  } catch (error) {
    console.error('Error fatal en la Edge Function:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
