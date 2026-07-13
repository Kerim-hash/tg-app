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

      if (chatType) {
        if (typeof tg.requestFullscreen === 'function') {
          try {
            tg.requestFullscreen()
          } catch (err) {
            console.warn('Failed to request fullscreen:', err)
            tg.expand()
          }
        } else {
          tg.expand()
        }
      } else {
        tg.expand()
        if (typeof tg.enableVerticalSwipes === 'function') {
          try {
            tg.enableVerticalSwipes()
          } catch (err) {
            console.warn('Failed to enable vertical swipes:', err)
          }
        }
      }
    } catch (e) {
      console.error('Telegram WebApp SDK ready error:', e)
    }
  }, [])

  return <>{children}</>
}
