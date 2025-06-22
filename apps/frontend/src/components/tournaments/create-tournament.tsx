'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Tournament } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { tournamentsAPI } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { X } from 'lucide-react'

interface CreateTournamentProps {
  onTournamentCreated: (tournament: Tournament) => void
  onCancel: () => void
}

interface CreateTournamentForm {
  name: string
  description: string
  game: string
  maxParticipants: number
  entryFee: number
  prizePool: number
  startDate: string
  startTime: string
}

export function CreateTournament({ onTournamentCreated, onCancel }: CreateTournamentProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CreateTournamentForm>()

  const onSubmit = async (data: CreateTournamentForm) => {
    setIsSubmitting(true)
    try {
      const startDateTime = new Date(`${data.startDate}T${data.startTime}`)
      
      const response = await tournamentsAPI.createTournament({
        name: data.name,
        description: data.description,
        game: data.game,
        maxParticipants: data.maxParticipants,
        entryFee: data.entryFee || 0,
        prizePool: data.prizePool || 0,
        startDate: startDateTime.toISOString(),
      })

      onTournamentCreated(response.data)
      toast({
        title: "Success",
        description: "Tournament created successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create tournament. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Create Tournament</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tournament Name</Label>
              <Input
                id="name"
                {...register('name', {
                  required: 'Tournament name is required',
                  minLength: {
                    value: 3,
                    message: 'Name must be at least 3 characters'
                  }
                })}
                placeholder="Epic Gaming Championship"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="game">Game</Label>
              <Input
                id="game"
                {...register('game', {
                  required: 'Game is required'
                })}
                placeholder="Fortnite, CS:GO, Valorant, etc."
              />
              {errors.game && (
                <p className="text-sm text-destructive">{errors.game.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe your tournament, rules, and format..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Max Participants</Label>
              <Input
                id="maxParticipants"
                type="number"
                min="2"
                max="256"
                {...register('maxParticipants', {
                  required: 'Max participants is required',
                  min: {
                    value: 2,
                    message: 'Minimum 2 participants required'
                  },
                  max: {
                    value: 256,
                    message: 'Maximum 256 participants allowed'
                  }
                })}
                placeholder="16"
              />
              {errors.maxParticipants && (
                <p className="text-sm text-destructive">{errors.maxParticipants.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="entryFee">Entry Fee ($)</Label>
              <Input
                id="entryFee"
                type="number"
                min="0"
                step="0.01"
                {...register('entryFee')}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prizePool">Prize Pool ($)</Label>
              <Input
                id="prizePool"
                type="number"
                min="0"
                step="0.01"
                {...register('prizePool')}
                placeholder="100.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                min={minDate}
                {...register('startDate', {
                  required: 'Start date is required'
                })}
              />
              {errors.startDate && (
                <p className="text-sm text-destructive">{errors.startDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                {...register('startTime', {
                  required: 'Start time is required'
                })}
              />
              {errors.startTime && (
                <p className="text-sm text-destructive">{errors.startTime.message}</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              variant="gaming"
            >
              {isSubmitting ? 'Creating...' : 'Create Tournament'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}