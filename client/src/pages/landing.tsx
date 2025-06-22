import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gaming-dark text-gaming-text">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-gaming-blue/5 to-gaming-purple/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(207,90%,54%,0.1),transparent_50%)]" />
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          {/* Logo */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-gaming-blue to-gaming-purple rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM4 7h16v11H4zm1-3h2l1 2H4zm12 0h2l1 2h-3z"/>
              </svg>
            </div>
            <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
              Gaming<span className="text-transparent bg-gradient-to-r from-gaming-blue to-gaming-purple bg-clip-text">X</span>
            </h1>
            <p className="text-xl text-gaming-text-dim">
              The ultimate professional gaming social platform
            </p>
          </div>

          {/* Main Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-gaming-card border-gaming-card-hover">
              <CardHeader>
                <div className="w-12 h-12 bg-gaming-blue/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-gaming-blue" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <CardTitle className="text-white">Tournaments</CardTitle>
                <CardDescription>
                  Compete in professional tournaments with prizes and recognition
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gaming-card border-gaming-card-hover">
              <CardHeader>
                <div className="w-12 h-12 bg-gaming-purple/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-gaming-purple" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H16c-.8 0-1.54.37-2.03.97L12 11l-1.97-2.03C9.54 8.37 8.8 8 8 8H5.46c-.8 0-1.51.49-1.82 1.24L1 16h2.5v6h2v-6h2.5l.69-2H7l1.5-3.5h.5L12 14l2.5-3.5h.5L16.5 14H15l.69 2H18v6h2z"/>
                  </svg>
                </div>
                <CardTitle className="text-white">Clans</CardTitle>
                <CardDescription>
                  Join forces with other gamers in powerful clans and climb the leaderboards
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gaming-card border-gaming-card-hover">
              <CardHeader>
                <div className="w-12 h-12 bg-gaming-emerald/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-gaming-emerald" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                  </svg>
                </div>
                <CardTitle className="text-white">Social Feed</CardTitle>
                <CardDescription>
                  Share your gaming moments and connect with the community
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* CTA */}
          <div className="space-y-4">
            <Button
              onClick={() => window.location.href = '/api/login'}
              className="bg-gradient-to-r from-gaming-blue to-gaming-purple hover:from-gaming-blue/80 hover:to-gaming-purple/80 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-2xl shadow-gaming-blue/25 transition-all duration-300 hover:scale-105"
            >
              Join GamingX Now
            </Button>
            <p className="text-sm text-gaming-text-dim">
              Connect with your gaming account to get started
            </p>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-gaming-blue rounded-full animate-pulse" />
        <div className="absolute top-40 right-32 w-1 h-1 bg-gaming-purple rounded-full animate-pulse delay-700" />
        <div className="absolute bottom-32 left-40 w-1.5 h-1.5 bg-gaming-emerald rounded-full animate-pulse delay-1000" />
      </div>

      {/* Features Section */}
      <section className="py-24 bg-gaming-darker">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            Everything you need for competitive gaming
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gaming-blue/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-gaming-blue" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 11H7v4a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-4h-2v3H9v-3zm3-9C8.4 2 5 5.4 5 9.5S8.4 17 12 17s7-3.4 7-7.5S15.6 2 12 2z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">AI-Powered Features</h3>
              <p className="text-gaming-text-dim">
                Auto-generate hashtags, moderate content, and get personalized gaming recommendations
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gaming-purple/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-gaming-purple" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Real-time Chat</h3>
              <p className="text-gaming-text-dim">
                Connect instantly with teammates and the gaming community through live chat
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gaming-emerald/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-gaming-emerald" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Tournament Management</h3>
              <p className="text-gaming-text-dim">
                Create and manage tournaments with automated brackets and scoring systems
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gaming-card border-t border-gaming-card-hover">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-gaming-blue to-gaming-purple rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM4 7h16v11H4zm1-3h2l1 2H4zm12 0h2l1 2h-3z"/>
              </svg>
            </div>
            <span className="text-lg font-bold text-white">GamingX</span>
          </div>
          <p className="text-gaming-text-dim">
            The professional gaming social platform for competitive players
          </p>
        </div>
      </footer>
    </div>
  );
}
