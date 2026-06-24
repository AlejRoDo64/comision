import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const passwordValida = await bcrypt.compare(dto.password, user.password);
    if (!passwordValida) throw new UnauthorizedException('Credenciales inválidas');

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, nombre: user.nombre, rol: user.rol },
    };
  }
}
