import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimeAgo(date: Date | string | null): string {
  if (!date) return ''
  
  const now = new Date()
  const targetDate = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return targetDate.toLocaleDateString()
}

export function formatXP(xp: number | null): string {
  if (!xp) return '0 XP'
  if (xp >= 1000000) return `${(xp / 1000000).toFixed(1)}M XP`
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}K XP`
  return `${xp} XP`
}

export function getLevel(xp: number | null): number {
  if (!xp) return 1
  return Math.floor(Math.sqrt(xp / 100)) + 1
}

export function getXPForNextLevel(currentXP: number | null): number {
  const level = getLevel(currentXP)
  return level * level * 100
}

export function getXPProgress(currentXP: number | null): number {
  if (!currentXP) return 0
  const level = getLevel(currentXP)
  const currentLevelXP = (level - 1) * (level - 1) * 100
  const nextLevelXP = level * level * 100
  return ((currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
}