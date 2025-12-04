import { defineStore } from 'pinia'
import { supabase } from 'boot/supabase'
import { ref } from 'vue'
import { useAuthStore } from './auth-store'

export const useDataStore = defineStore('data', () => {
  // --- ESTADO ---
  const authStore = useAuthStore()

  // Recursos Principales
  const lotes = ref([])
  const potreros = ref([])
  const fuentesAgua = ref([])
  const registrosLluvia = ref([])
  const dietas = ref([])
  const movimientos = ref([])
  const clima = ref({ current: null, historial: [], forecast: [] })
  const inventarioItems = ref([])
  const inventarioMovimientos = ref([])

  // Equipo, Configuración y Notificaciones
  const equipo = ref([])
  const notifications = ref([])
  const establecimientoActual = ref(null)

  // Estado de Detalle (Lote)
  const loteActual = ref(null)
  const evaluaciones = ref([])
  const eventosSanitarios = ref([])
  const eventosReproductivos = ref([])
  const consumos = ref([])

  // --- GETTERS ---
  const getPotreroById = (id) => potreros.value.find((p) => p.id === id)

  // --- ACCIONES DE CARGA ---
  async function fetchEstablecimiento() {
    if (!authStore.profile?.establecimiento_id) return
    try {
      const { data, error } = await supabase
        .from('establecimientos')
        .select('id, nombre, ciudad, provincia, emergencia_config')
        .eq('id', authStore.profile.establecimiento_id)
        .single()
      if (error) throw error
      establecimientoActual.value = data
    } catch (error) {
      console.error('Error fetching establecimiento:', error)
    }
  }

  async function fetchAll() {
    if (!authStore.profile) return
    listenToPotreroChanges()

    // Cargas prioritarias
    await fetchEstablecimiento()
    await fetchPotreros()
    await fetchLotes()

    // Cargas secundarias en paralelo
    await Promise.all([
      fetchInventarioItems(),
      fetchFuentesAgua(),
      fetchDietas(),
      fetchMovimientos(),
      fetchEquipo(),
      fetchNotifications(), // <--- IMPORTANTE: Cargar notificaciones
    ])
  }

  async function fetchLotes() {
    const establecimientoId = authStore.profile?.establecimiento_id
    if (!establecimientoId) return
    const { data, error } = await supabase
      .from('lotes')
      .select('*, potreros(nombre)')
      .eq('establecimiento_id', establecimientoId)
      .eq('activo', true)
      .order('identificacion', { ascending: true })
    if (error) throw error
    lotes.value = data
  }

  async function fetchPotreros() {
    const establecimientoId = authStore.profile?.establecimiento_id
    if (!establecimientoId) return
    const { data, error } = await supabase
      .from('potreros')
      .select('*')
      .eq('establecimiento_id', establecimientoId)
      .eq('activo', true)
    if (error) throw error
    potreros.value = data
  }

  async function fetchMovimientos() {
    const loteIds = lotes.value.map((l) => l.id)
    if (loteIds.length === 0) {
      movimientos.value = []
      return
    }
    const { data, error } = await supabase
      .from('movimientos_de_lotes')
      .select('*, potreros:potrero_id(nombre)')
      .in('lote_id', loteIds)
      .order('fecha_entrada', { ascending: false })
    if (error) console.error('Error fetching movimientos:', error)
    else movimientos.value = data
  }

  async function fetchInventarioItems() {
    const establecimientoId = authStore.profile?.establecimiento_id
    if (!establecimientoId) return
    const { data, error } = await supabase
      .from('inventario_items')
      .select('*')
      .eq('establecimiento_id', establecimientoId)
      .eq('activo', true)
      .order('nombre', { ascending: true })
    if (error) console.error(error)
    else inventarioItems.value = data
  }

  async function fetchFuentesAgua() {
    const establecimientoId = authStore.profile?.establecimiento_id
    if (!establecimientoId) return

    // Se agrega ', analisis_de_agua(*)' para traer los datos relacionados
    const { data, error } = await supabase
      .from('fuentes_de_agua')
      .select('*, potreros:potrero_id(nombre), analisis_de_agua(*)')
      .eq('establecimiento_id', establecimientoId)
      .eq('activo', true)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error cargando fuentes:', error)
      fuentesAgua.value = []
    } else {
      // Ordenamos los análisis por fecha descendente para que el [0] sea el actual
      data.forEach((fuente) => {
        if (fuente.analisis_de_agua && fuente.analisis_de_agua.length > 0) {
          fuente.analisis_de_agua.sort((a, b) => {
            return new Date(b.fecha_analisis) - new Date(a.fecha_analisis)
          })
        } else {
          fuente.analisis_de_agua = []
        }
      })

      fuentesAgua.value = data
    }
  }

  async function fetchRegistrosLluvia() {
    const establecimientoId = authStore.profile?.establecimiento_id
    if (!establecimientoId) return
    const { data, error } = await supabase
      .from('registros_lluvia')
      .select('*')
      .eq('establecimiento_id', establecimientoId)
      .order('fecha', { ascending: false })
    if (error) console.error('Error fetching lluvias:', error)
    else registrosLluvia.value = data
  }

  async function fetchDietas() {
    const establecimientoId = authStore.profile?.establecimiento_id
    if (!establecimientoId) return
    const { data, error } = await supabase
      .from('dietas')
      .select('*, dietas_items(*, alimentos(nombre, precio_kg))')
      .eq('establecimiento_id', establecimientoId)
    if (error) console.error('Error fetching dietas:', error)
    else dietas.value = data
  }

  async function fetchEquipo() {
    const estId = authStore.profile?.establecimiento_id
    if (!estId) return
    const { data, error } = await supabase
      .from('equipo_trabajo')
      .select('*')
      .eq('establecimiento_id', estId)
      .eq('activo', true)
      .order('nombre_completo', { ascending: true })

    if (error) console.error('Error fetching equipo:', error)
    else equipo.value = data
  }

  // --- GESTIÓN DE NOTIFICACIONES ---

  async function fetchNotifications() {
    const estId = authStore.profile?.establecimiento_id
    if (!estId) return
    const { data, error } = await supabase
      .from('notificaciones_programadas')
      .select('*')
      .eq('establecimiento_id', estId)
      .order('created_at', { ascending: false })

    if (!error) notifications.value = data
  }

  async function createNotification(notifData) {
    notifData.establecimiento_id = authStore.profile.establecimiento_id

    if (notifData.prioridad && notifData.prioridad.toLowerCase() === 'urgente') {
      notifData.fecha_programada = new Date().toISOString()
      notifData.estado = 'enviado'
    } else {
      notifData.estado = 'pendiente'
    }

    const { data, error } = await supabase
      .from('notificaciones_programadas')
      .insert(notifData)
      .select()

    if (error) throw error
    notifications.value.unshift(data[0])

    if (notifData.prioridad && notifData.prioridad.toLowerCase() === 'urgente') {
      await sendEmailTrigger(data[0])
    }
  }

  async function deleteNotification(id) {
    const { error } = await supabase.from('notificaciones_programadas').delete().eq('id', id)

    if (error) throw error
    notifications.value = notifications.value.filter((n) => n.id !== id)
  }

  async function sendEmailTrigger(notification) {
    try {
      let recipients = notification.destinatarios_snapshot
      if (typeof recipients === 'string') recipients = JSON.parse(recipients)

      if (!recipients || recipients.length === 0) return

      const payload = {
        tipo: notification.categoria ? notification.categoria.toUpperCase() : 'GENERAL',
        mensaje: notification.mensaje,
        destinatarios: recipients.map((r) => ({
          nombre: r.nombre,
          email: r.email,
          canal: 'email',
        })),
        asunto_extra: notification.titulo,
      }

      console.log('🚀 Enviando solicitud a Edge Function...', payload)

      const { error } = await supabase.functions.invoke('send-alert', {
        body: payload,
      })

      if (error) throw error
      console.log('✅ Correo despachado exitosamente.')
    } catch (e) {
      console.error('❌ Error enviando email:', e)
      await supabase
        .from('notificaciones_programadas')
        .update({ estado: 'fallido' })
        .eq('id', notification.id)

      const index = notifications.value.findIndex((n) => n.id === notification.id)
      if (index !== -1) notifications.value[index].estado = 'fallido'
    }
  }

  async function fetchClima() {
    if (potreros.value.length === 0) await fetchPotreros()
    const potreroConUbicacion = potreros.value.find((p) => p.geometria)
    let lat = -26.17,
      lng = -58.17
    if (potreroConUbicacion) {
      try {
        let geo = potreroConUbicacion.geometria
        if (typeof geo === 'string') geo = JSON.parse(geo)
        if (geo.type === 'Feature') geo = geo.geometry
        if (geo.type === 'Polygon') {
          lat = geo.coordinates[0][0][1]
          lng = geo.coordinates[0][0][0]
        }
      } catch (e) {
        console.error(e)
      }
    }
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=precipitation_sum,weathercode,temperature_2m_max,temperature_2m_min&current=temperature_2m,weathercode,windspeed_10m&timezone=auto&past_days=30&forecast_days=6`
      const response = await fetch(url)
      const d = await response.json()
      const daily = d.daily
      const historial = []
      const forecast = []
      for (let i = 0; i < daily.time.length; i++) {
        const dia = {
          fecha: daily.time[i],
          milimetros: daily.precipitation_sum[i],
          weathercode: daily.weathercode[i],
          temp_max: daily.temperature_2m_max[i],
          temp_min: daily.temperature_2m_min[i],
        }
        if (new Date(dia.fecha) <= new Date(new Date().setHours(0, 0, 0, 0))) historial.push(dia)
        else if (forecast.length < 5) forecast.push(dia)
      }
      clima.value = { current: d.current, historial: historial.reverse(), forecast: forecast }
    } catch {
      clima.value = { current: null, historial: [], forecast: [] }
    }
  }

  // --- FUNCIONES DE DETALLE (LOTE) ---
  async function fetchLoteDetalle(loteId) {
    if (!loteId) return
    const { data } = await supabase
      .from('lotes')
      .select('*, potreros(nombre)')
      .eq('id', loteId)
      .single()
    loteActual.value = data
    await Promise.all([
      fetchEvaluaciones(loteId),
      fetchEventosSanitarios(loteId),
      fetchEventosReproductivos(loteId),
      fetchConsumos(loteId),
    ])
  }

  async function fetchEvaluaciones(loteId) {
    const { data } = await supabase
      .from('evaluaciones')
      .select('*')
      .eq('lote_id', loteId)
      .order('fecha_evaluacion', { ascending: false })
    evaluaciones.value = data || []
  }

  async function fetchEventosSanitarios(loteId) {
    const { data } = await supabase
      .from('eventos_sanitarios')
      .select('*')
      .eq('lote_id', loteId)
      .order('fecha', { ascending: false })
    eventosSanitarios.value = data || []
  }

  async function fetchEventosReproductivos(loteId) {
    const { data } = await supabase
      .from('eventos_reproductivos')
      .select('*')
      .eq('lote_id', loteId)
      .order('fecha', { ascending: false })
    eventosReproductivos.value = data || []
  }

  async function fetchConsumos(loteId) {
    const { data } = await supabase
      .from('consumos_de_dieta')
      .select('*, dietas(nombre), alimentos(nombre)')
      .eq('lote_id', loteId)
      .order('fecha_inicio', { ascending: false })
    consumos.value = data || []
  }

  // --- FUNCIONES PARA REPORTES GLOBALES ---
  async function fetchAllEvaluaciones() {
    if (lotes.value.length === 0) await fetchLotes()
    const ids = lotes.value.map((l) => l.id)
    if (ids.length === 0) return
    const { data } = await supabase
      .from('evaluaciones')
      .select('*')
      .in('lote_id', ids)
      .order('fecha_evaluacion', { ascending: false })
    evaluaciones.value = data || []
  }

  async function fetchAllEventosSanitarios() {
    if (lotes.value.length === 0) await fetchLotes()
    const ids = lotes.value.map((l) => l.id)
    if (ids.length === 0) return
    const { data } = await supabase
      .from('eventos_sanitarios')
      .select('*')
      .in('lote_id', ids)
      .order('fecha', { ascending: false })
    eventosSanitarios.value = data || []
  }

  async function fetchAllEventosReproductivos() {
    if (lotes.value.length === 0) await fetchLotes()
    const ids = lotes.value.map((l) => l.id)
    if (ids.length === 0) return
    const { data } = await supabase
      .from('eventos_reproductivos')
      .select('*')
      .in('lote_id', ids)
      .order('fecha', { ascending: false })
    eventosReproductivos.value = data || []
  }

  async function fetchAllConsumos() {
    if (lotes.value.length === 0) await fetchLotes()
    const ids = lotes.value.map((l) => l.id)
    if (ids.length === 0) return
    const { data } = await supabase
      .from('consumos_de_dieta')
      .select('*, dietas(nombre), alimentos(nombre)')
      .in('lote_id', ids)
      .order('fecha_inicio', { ascending: false })
    consumos.value = data || []
  }

  async function fetchInventarioMovimientos() {
    if (inventarioItems.value.length === 0) await fetchInventarioItems()
    const ids = inventarioItems.value.map((i) => i.id)
    if (ids.length === 0) return
    const { data } = await supabase
      .from('inventario_movimientos')
      .select('*, inventario_items(nombre, unidad), lotes(identificacion)')
      .in('item_id', ids)
      .order('fecha', { ascending: false })
      .limit(100)
    inventarioMovimientos.value = data || []
  }

  // --- ESCRITURA GENÉRICA REACTIVA ---

  // Helper para mapear tabla -> referencia local
  function getLocalListByTableName(tableName) {
    switch (tableName) {
      case 'lotes':
        return lotes
      case 'potreros':
        return potreros
      case 'fuentes_de_agua':
        return fuentesAgua
      case 'inventario_items':
        return inventarioItems
      case 'registros_lluvia':
        return registrosLluvia
      case 'dietas':
        return dietas
      case 'equipo_trabajo':
        return equipo
      // Las tablas de detalle (evaluaciones, eventos) se manejan con lógica específica abajo
      default:
        return null
    }
  }

  async function createRegistro(tabla, registro) {
    const tablasSinEstablecimiento = [
      'evaluaciones',
      'eventos_sanitarios',
      'eventos_reproductivos',
      'consumos_de_dieta',
      'analisis_de_agua',
      'movimientos_de_lotes',
    ]

    // 1. Inyectar ID de establecimiento si hace falta
    if (!registro.establecimiento_id && !tablasSinEstablecimiento.includes(tabla)) {
      registro.establecimiento_id = authStore.profile?.establecimiento_id
    }

    // 2. Insertar en Supabase
    const { data, error } = await supabase.from(tabla).insert(registro).select()
    if (error) throw error
    const nuevoRegistro = data[0]

    // 3. ACTUALIZACIÓN REACTIVA AUTOMÁTICA

    // Caso A: Tablas principales (Lotes, Potreros, Fuentes, etc.)
    const listaLocal = getLocalListByTableName(tabla)
    if (listaLocal) {
      // Agregamos al principio para que se vea inmediato en la UI
      listaLocal.value.unshift(nuevoRegistro)
    }

    // Caso B: Tablas de detalle (lógica específica para cuando estamos viendo un lote)
    if (tabla === 'evaluaciones' && loteActual.value && registro.lote_id === loteActual.value.id) {
      evaluaciones.value.unshift(nuevoRegistro)
    }
    if (
      tabla === 'eventos_sanitarios' &&
      loteActual.value &&
      registro.lote_id === loteActual.value.id
    ) {
      eventosSanitarios.value.unshift(nuevoRegistro)
    }
    if (
      tabla === 'eventos_reproductivos' &&
      loteActual.value &&
      registro.lote_id === loteActual.value.id
    ) {
      eventosReproductivos.value.unshift(nuevoRegistro)
    }
    if (
      tabla === 'consumos_de_dieta' &&
      loteActual.value &&
      registro.lote_id === loteActual.value.id
    ) {
      consumos.value.unshift(nuevoRegistro)
    }

    return nuevoRegistro
  }

  async function updateRegistro(tabla, id, dataObject) {
    // 1. Actualizar en Supabase
    const { data, error } = await supabase.from(tabla).update(dataObject).eq('id', id).select()
    if (error) throw error
    const registroActualizado = data[0]

    // 2. ACTUALIZACIÓN REACTIVA LOCAL
    const listaLocal = getLocalListByTableName(tabla)
    if (listaLocal) {
      const index = listaLocal.value.findIndex((item) => item.id === id)
      if (index !== -1) {
        // Fusionamos los datos nuevos con los existentes para mantener la reactividad del objeto
        Object.assign(listaLocal.value[index], registroActualizado)
      }
    }

    // Caso especial: Si editamos el lote que estamos viendo en detalle actualmente
    if (tabla === 'lotes' && loteActual.value && loteActual.value.id === id) {
      Object.assign(loteActual.value, registroActualizado)
    }

    return registroActualizado
  }

  async function deactivateRegistro(tabla, id) {
    // 1. Soft Delete en Supabase (campo 'activo')
    const { data, error } = await supabase
      .from(tabla)
      .update({ activo: false })
      .eq('id', id)
      .select()
    if (error) throw error

    // 2. ACTUALIZACIÓN REACTIVA (Eliminar de la lista visual)
    const listaLocal = getLocalListByTableName(tabla)
    if (listaLocal) {
      listaLocal.value = listaLocal.value.filter((item) => item.id !== id)
    } else {
      // Fallback para tablas que quizás no están en el mapa pero se manejan manualmente
      if (tabla === 'lotes') lotes.value = lotes.value.filter((l) => l.id !== id)
      if (tabla === 'potreros') potreros.value = potreros.value.filter((l) => l.id !== id)
    }

    return data
  }

  // --- GESTIÓN DE EQUIPO Y EMERGENCIA ---

  async function saveMiembroEquipo(miembro) {
    miembro.establecimiento_id = authStore.profile.establecimiento_id
    const payload = { ...miembro }

    if (payload.id) {
      const { data, error } = await supabase
        .from('equipo_trabajo')
        .update(payload)
        .eq('id', payload.id)
        .select()
      if (error) throw error
      const index = equipo.value.findIndex((e) => e.id === payload.id)
      if (index !== -1) equipo.value[index] = data[0]
    } else {
      delete payload.id
      const { data, error } = await supabase.from('equipo_trabajo').insert(payload).select()
      if (error) throw error
      equipo.value.push(data[0])
    }
  }

  async function deleteMiembroEquipo(id) {
    const { error } = await supabase.from('equipo_trabajo').update({ activo: false }).eq('id', id)
    if (error) throw error
    equipo.value = equipo.value.filter((e) => e.id !== id)
  }

  async function updateConfigEmergencia(config) {
    const estId = authStore.profile.establecimiento_id
    const { error } = await supabase
      .from('establecimientos')
      .update({ emergencia_config: config })
      .eq('id', estId)
    if (error) throw error

    if (establecimientoActual.value) {
      establecimientoActual.value.emergencia_config = config
    }
  }

  // --- LÓGICA DE MOVIMIENTOS ---

  async function moverLote(
    loteId,
    potreroDestinoId,
    fechaEntrada = new Date().toISOString().split('T')[0],
  ) {
    const { data: movAbiertos } = await supabase
      .from('movimientos_de_lotes')
      .select('id')
      .eq('lote_id', loteId)
      .is('fecha_salida', null)

    if (movAbiertos && movAbiertos.length > 0) {
      await supabase
        .from('movimientos_de_lotes')
        .update({ fecha_salida: fechaEntrada })
        .in(
          'id',
          movAbiertos.map((m) => m.id),
        )
    }

    const newMovimiento = {
      lote_id: loteId,
      potrero_id: potreroDestinoId,
      fecha_entrada: fechaEntrada,
      observaciones: 'Movimiento desde Dashboard',
    }

    const { data: movData, error: movError } = await supabase
      .from('movimientos_de_lotes')
      .insert(newMovimiento)
      .select('*, potreros:potrero_id(nombre)')

    if (movError) throw movError

    await updateRegistro('lotes', loteId, { potrero_actual_id: potreroDestinoId })

    movimientos.value.unshift(movData[0])
    const loteEnStore = lotes.value.find((l) => l.id === loteId)
    if (loteEnStore) {
      loteEnStore.potrero_actual_id = potreroDestinoId
    }
  }

  async function moverLoteACorral(loteId) {
    const { data: movAbierto } = await supabase
      .from('movimientos_de_lotes')
      .select('id')
      .eq('lote_id', loteId)
      .is('fecha_salida', null)

    const fechaSalida = new Date().toISOString().split('T')[0]

    if (movAbierto && movAbierto.length > 0) {
      await supabase
        .from('movimientos_de_lotes')
        .update({ fecha_salida: fechaSalida })
        .in(
          'id',
          movAbierto.map((m) => m.id),
        )
    }

    await updateRegistro('lotes', loteId, { potrero_actual_id: null })

    const loteEnStore = lotes.value.find((l) => l.id === loteId)
    if (loteEnStore) {
      loteEnStore.potrero_actual_id = null
    }
  }

  // --- FUNCIONES AUXILIARES Y ESPECÍFICAS ---
  function getGDPV(evaluacionesDelLote) {
    if (!evaluacionesDelLote || evaluacionesDelLote.length < 2) return 0
    const evs = [...evaluacionesDelLote].sort(
      (a, b) => new Date(a.fecha_evaluacion) - new Date(b.fecha_evaluacion),
    )
    const p1 = parseFloat(evs[0].peso_promedio_kg),
      p2 = parseFloat(evs[evs.length - 1].peso_promedio_kg)
    const diff = Math.ceil(
      Math.abs(new Date(evs[evs.length - 1].fecha_evaluacion) - new Date(evs[0].fecha_evaluacion)) /
        86400000,
    )
    return diff > 0 ? ((p2 - p1) / diff).toFixed(3) : 0
  }
  function getCostoKgGanado() {
    return 0
  }
  function getTasaPrenez() {
    return 0
  }
  function listenToPotreroChanges() {
    const estId = authStore.profile?.establecimiento_id
    if (!estId) return
    supabase
      .channel(`public:potreros:${estId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'potreros',
          filter: `establecimiento_id=eq.${estId}`,
        },
        (payload) => {
          const idx = potreros.value.findIndex((p) => p.id === payload.new.id)
          if (idx !== -1) potreros.value[idx] = payload.new
        },
      )
      .subscribe()
  }

  // --- CORRECCIÓN: ACTUALIZACIÓN DE ESTADO LOCAL PARA AGUA ---
  async function agregarAnalisisDeAgua(data) {
    // 1. Guardar en BD
    const nuevoAnalisis = await createRegistro('analisis_de_agua', data)

    // 2. Actualizar el array local inmediatamente para que la tarjeta reaccione
    const fuente = fuentesAgua.value.find((f) => f.id === data.fuente_id)
    if (fuente) {
      // Asegurarnos de que el array existe (carga lazy)
      if (!fuente.analisis_de_agua) fuente.analisis_de_agua = []

      // Inyectar al inicio
      fuente.analisis_de_agua.unshift(nuevoAnalisis)
    }

    return { estado: 'Óptimo', peligros: [] }
  }

  async function createFuenteAgua(data) {
    return createRegistro('fuentes_de_agua', data)
  }
  async function updateFuenteAgua(id, data) {
    return updateRegistro('fuentes_de_agua', id, data)
  }
  async function deleteFuenteAgua(id) {
    return deactivateRegistro('fuentes_de_agua', id)
  }
  async function registrarMovimientoInventario(rpcData) {
    const { data, error } = await supabase.rpc('registrar_movimiento_inventario', rpcData)
    if (error) throw error
    return data
  }
  async function createInventarioItem(data) {
    return createRegistro('inventario_items', data)
  }
  async function updateInventarioItem(id, data) {
    return updateRegistro('inventario_items', id, data)
  }
  async function deleteInventarioItem(id) {
    return deactivateRegistro('inventario_items', id)
  }

  return {
    lotes,
    potreros,
    fuentesAgua,
    registrosLluvia,
    dietas,
    clima,
    movimientos,
    inventarioItems,
    inventarioMovimientos,
    equipo,
    notifications,
    loteActual,
    evaluaciones,
    eventosSanitarios,
    eventosReproductivos,
    consumos,
    establecimientoActual,
    getPotreroById,
    fetchAll,
    fetchClima,
    fetchLoteDetalle,
    fetchRegistrosLluvia,
    createRegistro,
    updateRegistro,
    deactivateRegistro,
    fetchLotes,
    fetchPotreros,
    fetchInventarioItems,
    fetchFuentesAgua,
    fetchDietas,
    fetchMovimientos,
    fetchInventarioMovimientos,
    fetchEquipo,
    fetchNotifications,
    fetchAllEvaluaciones,
    fetchAllEventosSanitarios,
    fetchAllEventosReproductivos,
    fetchAllConsumos,
    moverLote,
    moverLoteACorral,
    agregarAnalisisDeAgua,
    createFuenteAgua,
    updateFuenteAgua,
    deleteFuenteAgua,
    registrarMovimientoInventario,
    createInventarioItem,
    updateInventarioItem,
    deleteInventarioItem,
    saveMiembroEquipo,
    deleteMiembroEquipo,
    updateConfigEmergencia,
    createNotification,
    deleteNotification,
    getGDPV,
    getCostoKgGanado,
    getTasaPrenez,
  }
})
