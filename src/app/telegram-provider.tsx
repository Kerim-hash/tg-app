'use client'

import React, { useEffect } from 'react'
import WebApp from '@twa-dev/sdk'

export default function TelegramProvider({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    WebApp.ready()
    WebApp.expand() // разворачивает на всю высоту
  }, [])

  return <>{children}</>
}
