import { SetMetadata } from '@nestjs/common';
import { RolUsuario } from '../../users/interfaces/user.interface';

export const ROLES_KEY = 'roles';

/** Restringe un endpoint o controller a los roles indicados — HU-0223 */
export const Roles = (...roles: RolUsuario[]) => SetMetadata(ROLES_KEY, roles);
