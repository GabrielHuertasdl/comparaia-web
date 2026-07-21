'use client'

import { useState, useEffect, useCallback } from 'react'

export interface ConsentState {
  analytics: boolean
  advertising: boolean
  functional: true
  hasChosen: boolean
  policyVersion: string
}

const STORAGE_KEY = 'comparaia_consent'
const CURRENT_VERSION = process.env.NEXT_PUBLIC_COOKIE_POLICY_VERSION ?? '2025.1'

function defaultConsent(): ConsentState {
  return {
    analytics: false,
    advertising: false,
    functional: true,
    hasChosen: false,
    policyVersion: CURRENT_VERSION,
  }
}

function readFromStorage(): ConsentState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultConsent()
    const parsed = JSON.parse(raw) as Partial<ConsentState>
    return {
      analytics: parsed.analytics ?? false,
      advertising: parsed.advertising ?? false,
      functional: true,
      hasChosen: parsed.hasChosen ?? false,
      policyVersion: parsed.policyVersion ?? '',
    }
  } catch {
    return defaultConsent()
  }
}

function writeToStorage(state: ConsentState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // storage unavailable — proceed silently
  }
}

async function syncWithServer(state: ConsentState): Promise<void> {
  try {
    await fetch('/api/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        analytics: state.analytics,
        advertising: state.advertising,
        functional: state.functional,
        policyVersion: state.policyVersion,
      }),
    })
  } catch {
    // fire-and-forget — ignore failures
  }
}

export function useCookieConsent(): {
  consent: ConsentState
  hasChosen: boolean
  acceptAll: () => void
  rejectAll: () => void
  updateConsent: (partial: Partial<Pick<ConsentState, 'analytics' | 'advertising'>>) => void
  showBanner: boolean
} {
  const [consent, setConsent] = useState<ConsentState>(defaultConsent)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = readFromStorage()
    setConsent(stored)
    setMounted(true)
  }, [])

  const showBanner =
    mounted &&
    (!consent.hasChosen || consent.policyVersion !== CURRENT_VERSION)

  const acceptAll = useCallback(() => {
    const next: ConsentState = {
      analytics: true,
      advertising: true,
      functional: true,
      hasChosen: true,
      policyVersion: CURRENT_VERSION,
    }
    setConsent(next)
    writeToStorage(next)
    void syncWithServer(next)
  }, [])

  const rejectAll = useCallback(() => {
    const next: ConsentState = {
      analytics: false,
      advertising: false,
      functional: true,
      hasChosen: true,
      policyVersion: CURRENT_VERSION,
    }
    setConsent(next)
    writeToStorage(next)
    void syncWithServer(next)
  }, [])

  const updateConsent = useCallback(
    (partial: Partial<Pick<ConsentState, 'analytics' | 'advertising'>>) => {
      setConsent((prev) => {
        const next: ConsentState = {
          ...prev,
          ...partial,
          functional: true,
          hasChosen: true,
          policyVersion: CURRENT_VERSION,
        }
        writeToStorage(next)
        void syncWithServer(next)
        return next
      })
    },
    [],
  )

  return {
    consent,
    hasChosen: consent.hasChosen,
    acceptAll,
    rejectAll,
    updateConsent,
    showBanner,
  }
}
