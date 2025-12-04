// supabase/functions/asistente-ia/index.ts
// --- VERSIÓN CORREGIDA (Tokens aumentados, SafetySettings y CAMBIO DE MODELO) ---

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

// --- 1. DEFINICIÓN DE CONSTANTES (Nivel Superior) ---
const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY')

// *** CLAVE: Usamos el modelo Flash como principal por su estabilidad y rapidez. ***
const PRIMARY_MODEL = 'gemini-2.5-flash'
const BACKUP_MODELS = ['gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-2.0-flash-001']

// Función para listar modelos disponibles (usando v1beta)
async function listAvailableModels() {
  try {
    const response = await fetch(
      // USAMOS V1BETA
      `https://generativelanguage.googleapis.com/v1beta/models?key=${GOOGLE_API_KEY}`,
    )
    if (!response.ok) {
      console.error('Error al listar modelos:', await response.text())
      return []
    }
    const data = await response.json()
    console.log('Modelos disponibles:', JSON.stringify(data.models))
    return data.models || []
  } catch (error) {
    console.error('Error al consultar modelos disponibles:', error)
    return []
  }
}

// Función para generar respuesta usando un modelo específico (usando v1beta)
async function generateResponse(modelName, prompt) {
  // Sacamos el "models/" del nombre si es que viene
  const cleanModelName = modelName.startsWith('models/') ? modelName.substring(7) : modelName

  // USAMOS V1BETA
  const modelUrl = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModelName}:generateContent?key=${GOOGLE_API_KEY}`

  console.log(`Intentando con modelo: ${cleanModelName}`)

  const response = await fetch(modelUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      // --- INICIO DE CORRECCIONES ---
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192, // Aumentamos el límite de 2048 a 8192
      },
      // Añadimos Safety Settings para evitar bloqueos por el contexto de datos
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_NONE',
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_NONE',
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_NONE',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_NONE',
        },
      ],
      // --- FIN DE CORRECCIONES ---
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    console.error(`Error con modelo ${cleanModelName}:`, errorBody)
    return { success: false, error: errorBody, status: response.status }
  }

  const data = await response.json()

  // Log de depuración para ver por qué se detiene (si vuelve a pasar)
  console.log(
    'Razón de finalización (Google AI):',
    JSON.stringify(data.candidates[0]?.finishReason, null, 2),
  )

  return {
    success: true,
    response: data.candidates?.[0]?.content?.parts?.[0]?.text || 'No se obtuvo respuesta.',
  }
}

// --- INICIO DEL SERVIDOR ---
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Obtener el prompt del usuario y el contexto
    const { prompt, dataContext } = await req.json()

    // Validar que recibimos los datos
    if (!prompt || !dataContext) {
      console.error('Solicitud incompleta. Faltó "prompt" o "dataContext".')
      throw new Error('Solicitud incompleta. Faltó "prompt" o "dataContext".')
    }

    // 2. Construir el prompt para la IA con el contexto
    const contextStr = JSON.stringify(dataContext)
    const fullPrompt = `Contexto (datos del establecimiento): ${contextStr}\n\nUsuario: ${prompt}\n\nAsistente:`

    console.log('Enviando solicitud a la API:', {
      modeloUtilizado: PRIMARY_MODEL,
      prompt: fullPrompt.substring(0, 100) + '...',
    })

    // 3. Intentar con el modelo principal
    let result = await generateResponse(PRIMARY_MODEL, fullPrompt)

    // 4. Si falla, intentar con los modelos de respaldo
    if (!result.success) {
      if (result.status === 503 || result.status === 404) {
        for (const backupModel of BACKUP_MODELS) {
          console.log(`Modelo principal falló, intentando con ${backupModel}`)
          result = await generateResponse(backupModel, fullPrompt)
          if (result.success) {
            console.log(`Éxito con modelo de respaldo ${backupModel}`)
            break
          }
        }
      }

      // Si todos fallan, reportar el error
      if (!result.success) {
        console.warn('Todos los modelos fallaron. Listando modelos como diagnóstico:')
        await listAvailableModels() // Esto imprimirá en tus logs la lista de nuevo
        throw new Error('No se pudo generar respuesta con ningún modelo disponible.')
      }
    }

    // 5. Devolver la respuesta correcta al frontend
    return new Response(JSON.stringify({ response: result.response }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    // 6. Manejar errores internos
    console.error('Error fatal en la Edge Function:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
