// src/services/RbacService.ts

import {
  IRbacService,
  IRolePayload,
  IPermissionPayload,
  IUserRolePayload,
  IRolePermissionPayload,
  IRoleResponse,
  IPermissionResponse,
  IUserRolesResponse,
  IUserPermissionsResponse,
} from "../interfaces/IRbacService.js";

import Role from "../models/Role.js";
import Permission from "../models/Permission.js";
import User from "../models/User.js";
import UserRole from "../models/UserRole.js";
import RolePermission from "../models/RolePermission.js";

import {
  IRole,
  IPermission,
  IUser,
  // IUserRole,
  // IRolePermission,
} from "../models/Indx.js";

export class RbacService implements IRbacService {
  async getRloes(id?: string): Promise<IRoleResponse[]> {
    const query = id ? { _id: id } : {};
    const roles = (await Role.find(query).lean()) as unknown as IRole[];
    return roles.map((role) => this.mapRole(role));
  }

  async getPermissions(id?: string): Promise<IPermissionResponse[]> {
    const query = id ? { _id: id } : {};
    const permissions = (await Permission.find(
      query
    ).lean()) as unknown as IPermission[];
    return permissions.map((permission) => this.mapPermission(permission));
  }

  async getUserRoles(userId?: string): Promise<IUserRolesResponse[]> {
    const query = userId ? { userId } : {};
    const userRoles = await UserRole.find(query)
      .populate<{ userId: IUser }>("userId")
      .populate<{ roleId: IRole }>("roleId")
      .lean();

    if (userId && userRoles.length > 0) {
      const roles = userRoles.map((ur) => this.mapRole(ur.roleId as IRole));
      return [
        { user: this.mapUser(userRoles[0].userId as IUser), Roles: roles },
      ];
    }

    // group all
    const grouped = new Map<string, IUserRolesResponse>();
    for (const ur of userRoles) {
      const user = ur.userId as IUser;
      const role = ur.roleId as IRole;
      const uid = user._id.toString();
      if (!grouped.has(uid)) {
        grouped.set(uid, { user: this.mapUser(user), Roles: [] });
      }
      grouped.get(uid)!.Roles.push(this.mapRole(role));
    }
    return Array.from(grouped.values());
  }

  async getUserPermissions(
    userId?: string
  ): Promise<IUserPermissionsResponse[]> {
    const userRoles = await UserRole.find(userId ? { userId } : {})
      .populate<{ roleId: IRole }>("roleId")
      .lean();

    const roleIds = userRoles.map((ur) => (ur.roleId as IRole)._id);

    const rolePermissions = await RolePermission.find({
      roleId: { $in: roleIds },
    })
      .populate<{ permissionId: IPermission }>("permissionId")
      .lean();

    const permissions = rolePermissions.map((rp) =>
      this.mapPermission(rp.permissionId as IPermission)
    );

    if (userId) {
      const user = await User.findById(userId).lean();
      return [{ user: this.mapUser(user as unknown as IUser), permissions }];
    }

    return [{ permissions }];
  }

  async createRole(payload: IRolePayload): Promise<IRoleResponse> {
    const exists = await Role.findOne({ title: payload.title });
    if (exists) throw new Error("Role already exists");
    const role = await Role.create(payload);
    return this.mapRole(role);
  }

  async createPermission(
    payload: IPermissionPayload
  ): Promise<IPermissionResponse> {
    const exists = await Permission.findOne({ title: payload.title });
    if (exists) throw new Error("Permission already exists");
    const permission = await Permission.create(payload);
    return this.mapPermission(permission);
  }

  async assignRoleToUser(payload: IUserRolePayload): Promise<void> {
    const { userId, roleId } = payload;
    const exists = await UserRole.findOne({ userId, roleId });
    if (exists) throw new Error("User already has this role");
    await UserRole.create(payload);
  }

  async assignPermissionToRole(payload: IRolePermissionPayload): Promise<void> {
    const { roleId, permissionId } = payload;
    const exists = await RolePermission.findOne({ roleId, permissionId });
    if (exists) throw new Error("Permission already assigned to role");
    await RolePermission.create(payload);
  }

  private mapUser(user: IUser) {
    return {
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
    };
  }

  private mapRole(role: IRole): IRoleResponse {
    return {
      roleId: role._id.toString(),
      title: role.title,
      description: role.description || "",
      isActive: role.isActive,
    };
  }

  private mapPermission(permission: IPermission): IPermissionResponse {
    return {
      roleId: permission._id as unknown as string,
      title: permission.title,
      description: permission.description || "",
      isActive: permission.isActive,
    };
  }
}
