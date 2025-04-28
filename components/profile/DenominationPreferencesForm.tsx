'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

// Denomination options for pastor context
const DENOMINATIONS = [
  'non-denominational',
  'baptist',
  'lutheran',
  'methodist',
  'presbyterian',
  'anglican',
  'pentecostal',
  'catholic',
  'orthodox'
]

export default function DenominationPreferencesForm() {
  const { data: session } = useSession()
  const [denomination, setDenomination] = useState<string>('non-denominational')
  const [church, setChurch] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  
  // Load user preferences when component mounts
  useEffect(() => {
    if (!session?.user) return
    
    const loadPreferences = async () => {
      try {
        const response = await fetch('/api/users/preferences')
        if (!response.ok) throw new Error('Failed to load preferences')
        
        const data = await response.json()
        if (data.denomination) setDenomination(data.denomination)
        if (data.church) setChurch(data.church)
      } catch (error) {
        console.error('Error loading preferences:', error)
        toast.error('Failed to load your preferences')
      }
    }
    
    loadPreferences()
  }, [session])
  
  // Save user preferences
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session?.user) {
      toast.error('You must be signed in to save preferences')
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/users/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ denomination, church })
      })
      
      if (!response.ok) throw new Error('Failed to save preferences')
      
      toast.success('Your preferences have been saved')
    } catch (error) {
      console.error('Error saving preferences:', error)
      toast.error('Failed to save your preferences')
    } finally {
      setIsLoading(false)
    }
  }
  
  if (!session?.user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ministry Preferences</CardTitle>
          <CardDescription>Please sign in to set your ministry preferences</CardDescription>
        </CardHeader>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ministry Preferences</CardTitle>
        <CardDescription>Set your denominational context for more relevant content</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="denomination" className="text-sm font-medium">
              Denomination
            </label>
            <select
              id="denomination"
              value={denomination}
              onChange={(e) => setDenomination(e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2"
              disabled={isLoading}
            >
              {DENOMINATIONS.map((denom) => (
                <option key={denom} value={denom}>
                  {denom.charAt(0).toUpperCase() + denom.slice(1)}
                </option>
              ))}
            </select>
            <p className="text-sm text-muted-foreground">
              This helps tailor AI responses to your theological tradition
            </p>
          </div>
          
          <div className="space-y-1">
            <label htmlFor="church" className="text-sm font-medium">
              Church Name (Optional)
            </label>
            <input
              id="church"
              type="text"
              value={church}
              onChange={(e) => setChurch(e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2"
              placeholder="Your church name"
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Preferences'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}