'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { authAPI } from '@/lib/api'
import { Gamepad2, Trophy, Users, MessageCircle, Zap, Shield } from 'lucide-react'

export function LandingPage() {
  const features = [
    {
      icon: Trophy,
      title: 'Tournaments',
      description: 'Compete in organized tournaments with brackets and prizes'
    },
    {
      icon: Users,
      title: 'Clans',
      description: 'Join gaming communities and build your reputation'
    },
    {
      icon: MessageCircle,
      title: 'Real-time Chat',
      description: 'Connect with gamers worldwide through instant messaging'
    },
    {
      icon: Zap,
      title: 'XP System',
      description: 'Level up and track your gaming achievements'
    },
    {
      icon: Shield,
      title: 'AI Moderation',
      description: 'Safe gaming environment with intelligent content filtering'
    },
    {
      icon: Gamepad2,
      title: 'Multi-platform',
      description: 'Support for all major gaming platforms and titles'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-gaming-primary/20">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Gamepad2 className="h-8 w-8 text-gaming-primary" />
            <span className="text-2xl font-bold">GamingX</span>
          </div>
          <Button onClick={authAPI.login} variant="gaming">
            Get Started
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-gaming-primary to-gaming-secondary bg-clip-text text-transparent">
            The Ultimate Gaming Platform
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the premier social platform for professional gamers. Compete in tournaments, 
            build your clan, and connect with players worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={authAPI.login} variant="gaming" size="lg" className="text-lg px-8 py-3">
              Start Gaming
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Why Choose GamingX?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to elevate your gaming experience and connect with the community
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <feature.icon className="h-12 w-12 text-gaming-primary mb-4" />
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-card/30 backdrop-blur-sm rounded-lg border border-border/50 p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-gaming-primary mb-2">10K+</div>
              <div className="text-muted-foreground">Active Players</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gaming-secondary mb-2">500+</div>
              <div className="text-muted-foreground">Tournaments Hosted</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gaming-accent mb-2">100+</div>
              <div className="text-muted-foreground">Gaming Clans</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="bg-gradient-to-r from-gaming-primary to-gaming-secondary rounded-lg p-12 text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Level Up?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of gamers already competing and connecting on GamingX
          </p>
          <Button onClick={authAPI.login} variant="secondary" size="lg" className="text-lg px-8 py-3">
            Join Now - It's Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-border/50">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Gamepad2 className="h-6 w-6 text-gaming-primary" />
            <span className="font-bold">GamingX</span>
          </div>
          <div className="text-sm text-muted-foreground">
            © 2024 GamingX. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}