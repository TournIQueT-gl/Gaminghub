'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Clan } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { clansAPI } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { X } from 'lucide-react'

interface CreateClanProps {
  onClanCreated: (clan: Clan) => void
  onCancel: () => void
}

interface CreateClanForm {
  name: string
  description: string
  imageUrl: string
  isPublic: boolean
}

export function CreateClan({ onClanCreated, onCancel }: CreateClanProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<CreateClanForm>({
    defaultValues: {
      isPublic: true
    }
  })

  const isPublic = watch('isPublic')

  const onSubmit = async (data: CreateClanForm) => {
    setIsSubmitting(true)
    try {
      const response = await clansAPI.createClan({
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl || null,
        isPublic: data.isPublic
      })

      onClanCreated(response.data)
      toast({
        title: "Success",
        description: "Clan created successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create clan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Create Clan</CardTitle>
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
          <div className="space-y-2">
            <Label htmlFor="name">Clan Name</Label>
            <Input
              id="name"
              {...register('name', {
                required: 'Clan name is required',
                minLength: {
                  value: 3,
                  message: 'Name must be at least 3 characters'
                },
                maxLength: {
                  value: 30,
                  message: 'Name must be 30 characters or less'
                }
              })}
              placeholder="Elite Gamers"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description', {
                maxLength: {
                  value: 500,
                  message: 'Description must be 500 characters or less'
                }
              })}
              placeholder="Describe your clan's goals, games, and community..."
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Clan Logo URL (Optional)</Label>
            <Input
              id="imageUrl"
              type="url"
              {...register('imageUrl')}
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isPublic"
              checked={isPublic}
              onCheckedChange={(checked) => setValue('isPublic', checked)}
            />
            <Label htmlFor="isPublic" className="cursor-pointer">
              Public Clan
            </Label>
          </div>
          <p className="text-sm text-muted-foreground">
            {isPublic 
              ? 'Anyone can discover and join your clan'
              : 'Clan is private and requires an invitation'
            }
          </p>

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
              {isSubmitting ? 'Creating...' : 'Create Clan'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}