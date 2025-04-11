import { SetMetadata } from '@nestjs/common';
import { PermissionType } from 'src/iam/permission.type';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: PermissionType[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);