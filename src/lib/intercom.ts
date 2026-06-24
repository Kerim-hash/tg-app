'use client'

import { useEffect } from 'react'
import Intercom from '@intercom/messenger-js-sdk'

export default function IntercomWidget({ appId }: { appId: string }) {
  useEffect(() => {
    Intercom({ app_id: appId, utm_source: 'fg_en', language_override: 'en', hide_default_launcher: true })

    return () => {
      window.Intercom?.('shutdown')
    }
  }, [appId])

  return null
}
