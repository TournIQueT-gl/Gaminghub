import { Progress } from '@/components/ui/progress'
import { getLevel, getXPForNextLevel, getXPProgress, formatXP } from '@/lib/utils'

interface XPProgressBarProps {
  currentXP: number | null
  showText?: boolean
  className?: string
}

export function XPProgressBar({ currentXP, showText = true, className }: XPProgressBarProps) {
  const level = getLevel(currentXP)
  const nextLevelXP = getXPForNextLevel(currentXP)
  const progress = getXPProgress(currentXP)

  const currentLevelXP = (level - 1) * (level - 1) * 100
  const xpInCurrentLevel = (currentXP || 0) - currentLevelXP
  const xpNeededForNextLevel = nextLevelXP - currentLevelXP

  return (
    <div className={className}>
      {showText && (
        <div className="flex justify-between text-sm mb-2">
          <span>Level {level}</span>
          <span>{xpInCurrentLevel} / {xpNeededForNextLevel} XP</span>
        </div>
      )}
      <Progress 
        value={progress} 
        className="h-2 bg-secondary"
      />
      {showText && (
        <div className="text-xs text-muted-foreground mt-1">
          {formatXP(nextLevelXP - (currentXP || 0))} XP to next level
        </div>
      )}
    </div>
  )
}