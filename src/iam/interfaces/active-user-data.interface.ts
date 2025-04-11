import { Role } from "src/users/enums/role.enum";
import { PermissionType } from "../permission.type";

export interface ActiveUserData {
    sub: number;
    pseudo: string;
    id: any;
    role: Role;
    permissions: PermissionType[];
}