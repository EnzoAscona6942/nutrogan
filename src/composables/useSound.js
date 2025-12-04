// src/composables/useSound.js
export function useSound() {
  const play = (soundName, volume = 0.5) => {
    try {
      const audio = new Audio(`/sounds/${soundName}.mp3`)
      audio.volume = volume
      audio.play().catch((e) => console.warn('Audio play blocked', e))
    } catch (e) {
      console.error('Error audio:', e)
    }
  }

  // Tus nuevos atajos personalizados
  const playMuu = () => play('muu', 0.6) // Vaca
  const playCheck = () => play('check', 0.5) // Notificación
  const playNdvi = () => play('ndvi', 0.5) // Satélite
  const playClick = () => play('click', 0.3) // Click general

  return {
    play,
    playMuu,
    playCheck,
    playNdvi,
    playClick,
  }
}
