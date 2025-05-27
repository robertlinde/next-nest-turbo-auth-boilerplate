// Src/auth/jwt.strategy.ts

import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {PassportStrategy} from '@nestjs/passport';
import {Request} from 'express';
import {ExtractJwt, Strategy} from 'passport-jwt';
import {ConfigKey} from 'src/config/config-key.enum.ts';
import {ActiveUserData} from './types/active-user-data.type.ts';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    const jwtAccessSecret = configService.get<string>(ConfigKey.JWT_ACCESS_SECRET) ?? 'secret';

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request): string => request?.cookies?.access_token as string, // ← from cookie
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtAccessSecret,
    });
  }

  /**
   * This method is called if the JWT is valid.
   * The returned value becomes `req.user`.
   */
  async validate(payload: {sub: string}): Promise<ActiveUserData> {
    return {
      userId: payload.sub,
    };
  }
}
