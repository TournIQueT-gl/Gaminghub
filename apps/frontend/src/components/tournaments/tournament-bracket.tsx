import { Tournament } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Users } from 'lucide-react'

interface TournamentBracketProps {
  bracket: any
  tournament: Tournament
}

export function TournamentBracket({ bracket, tournament }: TournamentBracketProps) {
  if (!bracket || !bracket.matches) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <div className="text-muted-foreground mb-2">Bracket not available</div>
          <p className="text-sm text-muted-foreground">
            {tournament.status === 'upcoming' 
              ? 'The bracket will be generated when the tournament starts.'
              : 'Bracket data is not available for this tournament.'
            }
          </p>
        </CardContent>
      </Card>
    )
  }

  const rounds = bracket.rounds || []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="h-5 w-5 mr-2" />
          Tournament Bracket
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-fit space-y-8">
            {rounds.map((round: any, roundIndex: number) => (
              <div key={roundIndex}>
                <h3 className="font-medium mb-4">
                  {roundIndex === rounds.length - 1 ? 'Final' : 
                   roundIndex === rounds.length - 2 ? 'Semi-Final' :
                   roundIndex === rounds.length - 3 ? 'Quarter-Final' :
                   `Round ${roundIndex + 1}`}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {round.matches?.map((match: any) => (
                    <div
                      key={match.id}
                      className="border rounded-lg p-4 bg-card"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-medium">Match {match.id}</div>
                        <Badge variant={
                          match.status === 'completed' ? 'default' :
                          match.status === 'active' ? 'secondary' : 'outline'
                        }>
                          {match.status}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        {/* Participant 1 */}
                        <div className={`flex items-center justify-between p-2 rounded ${
                          match.winnerId === match.participant1?.id ? 'bg-gaming-primary/20' : 'bg-muted/50'
                        }`}>
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4" />
                            <span className="text-sm">
                              {match.participant1?.user?.username || 'TBD'}
                            </span>
                          </div>
                          {match.winnerId === match.participant1?.id && (
                            <Trophy className="h-4 w-4 text-gaming-primary" />
                          )}
                        </div>

                        {/* VS Separator */}
                        <div className="text-center text-xs text-muted-foreground">
                          VS
                        </div>

                        {/* Participant 2 */}
                        <div className={`flex items-center justify-between p-2 rounded ${
                          match.winnerId === match.participant2?.id ? 'bg-gaming-primary/20' : 'bg-muted/50'
                        }`}>
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4" />
                            <span className="text-sm">
                              {match.participant2?.user?.username || 'TBD'}
                            </span>
                          </div>
                          {match.winnerId === match.participant2?.id && (
                            <Trophy className="h-4 w-4 text-gaming-primary" />
                          )}
                        </div>
                      </div>

                      {/* Match Score */}
                      {match.score && (
                        <div className="mt-3 text-center text-sm text-muted-foreground">
                          Score: {JSON.stringify(match.score)}
                        </div>
                      )}

                      {/* Match Time */}
                      {match.scheduledAt && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          {match.status === 'completed' ? 'Completed' : 'Scheduled'}: {' '}
                          {new Date(match.scheduledAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}