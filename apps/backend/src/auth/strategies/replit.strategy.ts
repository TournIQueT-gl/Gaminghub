import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ReplitStrategy extends PassportStrategy(Strategy, 'replit') {
  constructor(private readonly configService: ConfigService) {
    super({
      authorizationURL: 'https://replit.com/oauth/authorize',
      tokenURL: 'https://replit.com/oauth/token',
      clientID: configService.get('REPL_ID'),
      clientSecret: configService.get('REPLIT_CLIENT_SECRET'),
      callbackURL: configService.get('REPLIT_CALLBACK_URL') || 'http://localhost:5000/auth/replit/callback',
      scope: ['openid', 'email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    // Extract user information from Replit profile
    return {
      id: profile.id,
      email: profile.email,
      username: profile.username,
      firstName: profile.firstName,
      lastName: profile.lastName,
      profileImageUrl: profile.profileImageUrl,
      accessToken,
      refreshToken,
    };
  }
}