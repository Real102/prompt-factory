import { useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'

const ROOT_FONT_SIZE = 12

const applyScale = (scale: number) => {
  document.documentElement.style.fontSize = `${ROOT_FONT_SIZE * scale}px`
}

export function useUiScale() {
  useEffect(() => {
    let unlisten: (() => void) | undefined
    invoke<number>('get_ui_scale').then(applyScale).catch(() => {})
    listen<number>('ui-scale-changed', (e) => applyScale(e.payload))
      .then((un) => {
        unlisten = un
      })
      .catch(() => {})
    return () => {
      unlisten?.()
    }
  }, [])
}
