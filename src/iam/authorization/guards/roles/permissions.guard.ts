import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ActiveUserData } from '../../../../iam/interfaces/active-user-data.interface';
import { REQUEST_USER_KEY } from '../../../../iam/iam.constants';
import { PermissionType } from '../../../../iam/permission.type';
import { PERMISSIONS_KEY } from '../../../../iam/decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const contextPermissions = this.reflector.getAllAndOverride<PermissionType[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if(!contextPermissions) {
      return true;
    }
    const user: ActiveUserData = context.switchToHttp().getRequest()[REQUEST_USER_KEY];
    return contextPermissions.every((permission) => user.permissions?.includes(permission));
  }
}
