'use client'

import React, { useEffect } from 'react'
import WebApp from '@twa-dev/sdk'

export default function TelegramProvider({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    try {
      WebApp.ready()
      const tg = WebApp as any
      const chatType = tg.initDataUnsafe?.chat_type

      tg.expand()

      // Expose Telegram safe-area / content insets as CSS variables so screens
      // can offset content under the native header in both fullscreen and
      // compact (in-chat) modes. Falls back to env(safe-area-inset-*) in CSS.
      const applyInsets = () => {
        const root = document.documentElement
        const safe = tg.safeAreaInset
        const content = tg.contentSafeAreaInset
        if (safe && typeof safe.top === 'number') {
          root.style.setProperty('--tg-safe-top', `${safe.top}px`)
          root.style.setProperty('--tg-safe-bottom', `${safe.bottom ?? 0}px`)
        }
        if (content && typeof content.top === 'number') {
          root.style.setProperty('--tg-content-top', `${content.top}px`)
        }
      }
      applyInsets()
      if (typeof tg.onEvent === 'function') {
        tg.onEvent('safeAreaChanged', applyInsets)
        tg.onEvent('contentSafeAreaChanged', applyInsets)
        tg.onEvent('viewportChanged', applyInsets)
        tg.onEvent('fullscreenChanged', applyInsets)
      }
      if (typeof tg.enableVerticalSwipes === 'function') {
        try {
          tg.enableVerticalSwipes()
        } catch (err) {
          console.warn('Failed to enable vertical swipes:', err)
        }
      }
    } catch (e) {
      console.error('Telegram WebApp SDK ready error:', e)
    }
  }, [])

  return <>{children}</>
}
