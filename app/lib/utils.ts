import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Centralized API base URL for the frontend
export function getApiBaseUrl() {
  // Prefer runtime config injected at container start
  const runtimeBase = (globalThis as any)?.window?.__RUNTIME_CONFIG__?.VITE_API_BASE_URL
  if (runtimeBase) return String(runtimeBase).replace(/\/$/, '')

  // Fallback to build-time env
  const envBase = (import.meta as any).env?.VITE_API_BASE_URL || ''
  
  // For local development, default to localhost:5000
  if (!envBase && !runtimeBase) {
    return 'http://localhost:5000'
  }
  
  return String(envBase).replace(/\/$/, '')
}

// Safely build an absolute image URL from a relative or absolute value
export function buildImageUrl(imageUrl?: string | null): string {
  if (!imageUrl) return ''
  const url = String(imageUrl)
  if (/^https?:\/\//i.test(url)) return url
  const base = getApiBaseUrl()
  return `${base}${url}`
}