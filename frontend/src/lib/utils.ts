import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Format an address to a shortened version
 */
export function formatAddress(address: string): string {
  if (!address) return ""
  if (address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * Format a timestamp to a readable date
 */
export function formatDate(timestamp: number): string {
  console.log(timestamp)
  return new Date(timestamp*1000).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

