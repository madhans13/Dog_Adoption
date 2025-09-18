import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Centralized API base URL for the frontend
// Centralized API base URL for the frontend
export function getApiBaseUrl() {
  // 1. Runtime config (injected at container start, e.g. from Kubernetes env)
  if (typeof window !== 'undefined') {
    const runtimeConfig =
      (window as any).__RUNTIME_CONFIG__?.VITE_API_BASE_URL ||
      (window as any).__RUNTIME_CONFIG__?.RUNTIME_API_BASE_URL

    if (runtimeConfig) {
      return String(runtimeConfig).replace(/\/$/, '')
    }
  }

  // 2. Build-time env (Vite injects at build)
  const envBase =
    (import.meta as any).env?.VITE_API_BASE_URL ||
    (import.meta as any).env?.RUNTIME_API_BASE_URL ||
    ''

  if (envBase) {
    return String(envBase).replace(/\/$/, '')
  }

  // 3. Fallback (only for local dev)
  return 'http://localhost:5000'
}

// Safely build an absolute image URL from a relative or absolute value
export function buildImageUrl(imageUrl?: string | null): string {
  if (!imageUrl) return ''
  const url = String(imageUrl)
  if (/^https?:\/\//i.test(url)) return url
  const base = getApiBaseUrl()
  return `${base}${url}`
}