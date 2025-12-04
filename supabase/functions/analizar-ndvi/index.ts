// --- CÓDIGO v51 (Sentinel Hub - FIX: Usar .update() en lugar de .upsert()) ---

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'


const evalscript_stats = `
//VERSION=3
function setup() {
  return {
    input: ["B04", "B08", "dataMask"],
    output: [
      { id: "default", bands: 1, sampleType: "FLOAT32" },
      { id: "dataMask", bands: 1, sampleType: "UINT8" }
    ]
  };
}

function evaluatePixel(sample) {
  if (sample.dataMask == 0) {
     return { default: [NaN], dataMask: [0] };
  }
  let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
  return {
    default: [isNaN(ndvi) ? NaN : ndvi],
    dataMask: [1]
  };
}
`

const SENTINEL_API_URL = 'https://services.sentinel-hub.com/api/v1/statistics'

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

function validarGeoJson(geojson: any): any | null {
  let geoData = geojson
  if (typeof geoData === 'string') {
    try {
      geoData = JSON.parse(geoData)
    } catch (e) {
      console.error('Error parseando GeoJSON string:', e)
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

async function getNdviForPotrero(
  potreroGeoJson: any,
  sentinelToken: string,
): Promise<number | null> {
  const validGeoJson = validarGeoJson(potreroGeoJson)
  if (!validGeoJson) {
    console.error('GeoJSON inválido o no es un Polígono.')
    return null
  }

  const dateTo = new Date().toISOString()
  const dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const requestBody = {
    input: {
      bounds: {
        geometry: validGeoJson,
      },
      data: [
        {
          type: 'sentinel-2-l2a',
          dataFilter: { maxCloudCoverage: 20 },
          processing: {
            upsampling: 'BICUBIC',
            downsampling: 'BICUBIC',
          },
        },
      ],
    },
    aggregation: {
      evalscript: evalscript_stats,
      timeRange: {
        from: dateFrom,
        to: dateTo,
      },
      aggregationInterval: { of: 'P30D' },
      resolution: { x: 10, y: 10 },
    },
  }

  try {
    const response = await fetch(SENTINEL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sentinelToken}`,
        Accept: 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      console.error(`Error en API Sentinel (No-OK):`, await response.text())
      return null
    }

    const jsonData = await response.json()
    const stats = jsonData?.data?.[0]?.outputs?.default?.bands?.B0?.stats
    const validPixels = (stats?.sampleCount || 0) - (stats?.noDataCount || 0)

    if (stats && stats.mean !== null && validPixels > 0) {
      return stats.mean
    } else {
      console.warn(
        'No se encontró "mean" o no hay píxeles válidos (nubes o polígono muy pequeño?).',
        JSON.stringify(stats),
      )
      return null
    }
  } catch (err) {
    console.error('Error fatal al obtener NDVI para potrero:', err)
    return null
  }
}


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('--- EJECUTANDO CÓDIGO v51 (FIX: .update() en lugar de .upsert()) ---')

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('PRIVATE_SUPABASE_SERVICE_KEY') ?? '',
    )

    const body = await req.json()
    const { establecimiento_id, potrero_ids } = body
    if (!establecimiento_id) {
      throw new Error('No se proporcionó establecimiento_id.')
    }

    const sentinelToken = await getSentinelToken()

    console.log('Buscando potreros desde Supabase...')

    let query = supabaseAdmin
      .from('potreros')
      .select('id, nombre, geometria')
      .eq('establecimiento_id', establecimiento_id)
      .neq('geometria', null)

    if (potrero_ids && Array.isArray(potrero_ids) && potrero_ids.length > 0) {
      query = query.in('id', potrero_ids)
    }

    const { data: potreros, error: potrerosError } = await query

    if (potrerosError) throw potrerosError
    if (!potreros || potreros.length === 0) {
      throw new Error('No se encontraron potreros con geometría para analizar.')
    }

    console.log(`Se encontraron ${potreros.length} potreros. Analizando...`)

    const updatesData = []
    const resultados = []

    for (const potrero of potreros) {
      console.log(`Potrero: ${potrero.nombre}`)
      const ndviValue = await getNdviForPotrero(potrero.geometria, sentinelToken)

      if (ndviValue !== null) {
        updatesData.push({
          id: potrero.id,
          ultimo_ndvi: ndviValue,
          fecha_ultimo_ndvi: new Date().toISOString(),
        })
        resultados.push({
          id: potrero.id,
          nombre: potrero.nombre,
          ndvi: ndviValue,
          fecha: new Date().toISOString(),
          estado: 'exitoso',
        })
        console.log(`-> Potrero ${potrero.nombre} OK. NDVI: ${ndviValue.toFixed(5)}`)
      } else {
        console.log(`-> Potrero ${potrero.nombre} sin datos válidos (nubes o error).`)
      }
    }

    // --- CORRECCIÓN v51 ---
    // Usamos .update() en un bucle en lugar de .upsert()
    // Esto evita el error 'violates not-null constraint' en la columna 'nombre'
    if (updatesData.length > 0) {
      console.log(`Guardando ${updatesData.length} actualizaciones...`)

      for (const update of updatesData) {
        const { error: updateError } = await supabaseAdmin
          .from('potreros')
          .update({
            ultimo_ndvi: update.ultimo_ndvi,
            fecha_ultimo_ndvi: update.fecha_ultimo_ndvi,
          })
          .eq('id', update.id) // <-- Actualizamos por ID

        if (updateError) {
          // Si falla un update, lo reportamos pero continuamos
          console.error(`Error al actualizar potrero ${update.id}:`, updateError.message)
          // Lanzamos el error para que la función falle y devuelva un 500
          // Esto previene que la app muestre un éxito falso.
          throw updateError
        }
      }
    } else {
      console.log('No se encontraron nuevos datos de NDVI.')
    }

    console.log('¡Análisis completado!')
    return new Response(
      JSON.stringify({
        message: `Análisis completado. ${updatesData.length} potreros actualizados.`,
        resultados,
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
