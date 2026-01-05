'use client'

import React, { type ReactNode, useMemo, useState } from 'react'
import { QueryClient } from '@tanstack/react-query'
import { AppProvider } from '@trezoa-commerce/connector'
import { ArcProvider } from '@trezoa-commerce/sdk/react'
// Removed unused createProvider import
import { FloatingCommerceButton } from './components/floating-commerce-button'

export function ClientRootProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { 
      queries: { 
        staleTime: 5 * 60 * 1000, 
        retry: 3 
      } 
    }
  }))

  const arcConfig = useMemo(() => ({
    network: (process.env.NEXT_PUBLIC_trezoa_NETWORK as 'mainnet' | 'devnet' | 'testnet' | undefined) || 'devnet',
    rpcUrl:
      (process.env.NEXT_PUBLIC_trezoa_RPC_URL && process.env.NEXT_PUBLIC_trezoa_RPC_URL.trim()) ||
      ((process.env.NEXT_PUBLIC_trezoa_NETWORK === 'devnet')
        ? 'https://api.devnet.trezoa.com'
        : (process.env.NEXT_PUBLIC_trezoa_NETWORK === 'testnet')
          ? 'https://api.testnet.trezoa.com'
          : 'https://api.mainnet-beta.trezoa.com'),
    autoConnect: true,
    // Removed unused providers array - ArcWebClientConfig doesn't support it
  }), [])


  return (
    <AppProvider 
      connectorConfig={{ 
        autoConnect: false, 
        debug: process.env.NODE_ENV !== 'production' 
      }} 
    >
      <ArcProvider config={arcConfig} queryClient={queryClient}>
        <>
          {children}
          <FloatingCommerceButton />
        </>
      </ArcProvider>
    </AppProvider>
  )
}