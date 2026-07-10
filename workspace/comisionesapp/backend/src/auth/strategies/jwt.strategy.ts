import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RolUsuario } from '../../users/interfaces/user.interface';

export interface JwtPayload {
  sub: number;
  email: string;
  nombre: string;
  rol: RolUsuario;
  iat?: number;
  exp?: number;
}

/**
 * Fuente única del secreto JWT: sin fallback hardcodeado — si falta la
 * variable de entorno, la aplicación no arranca (fail-fast).
 */
export function obtenerJwtSecret(configService: ConfigService): string {
  const secret = configService.get<string>('JWT_SECRET');
  if (!secret) {
    throw new Error('JWT_SECRET no está definido. Configúrelo en el archivo .env.');
  }
  return secret;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: obtenerJwtSecret(configService),
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    return payload;
  }
}
