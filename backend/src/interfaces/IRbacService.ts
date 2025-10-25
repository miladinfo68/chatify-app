// src/interfaces/IRbacService.ts 
import { Types } from "mongoose";

export interface IRbacService {
  getRloes(id?: string): Promise<IRoleResponse[]>;
  getPermissions(id?: string): Promise<IPermissionResponse[]>;
  getUserPermissions(userId?: string): Promise<IUserPermissionsResponse[]>;
  getUserRoles(id?: string): Promise<IUserRolesResponse[]>;
  createRole(payload: IRolePayload): Promise<IRoleResponse>;
  createPermission(payload: IPermissionPayload): Promise<IPermissionResponse>;
  assignRoleToUser(payload: IUserRolePayload): Promise<void>;
  assignPermissionToRole(payload: IRolePermissionPayload): Promise<void>;
}

export interface IRoleResponse {
  roleId: string;
  title: string;
  description: string;
  isActive: boolean;
}

export interface IPermissionResponse {
  roleId: string;
  title: string;
  description: string;
  isActive: boolean;
}

export interface IUserResponse {
  userId: string;
  name: string;
  email: string;
  // mobile: string;
}

export interface IUserPermissionsResponse {
  user?: IUserResponse; //permissions of all/one users
  permissions: IPermissionResponse[];
}

export interface IUserRolesResponse {
  user?: IUserResponse; // roles of all/one users
  Roles: IRoleResponse[]; //Array<{ [key: string]: boolean }>;
}

export interface IRolePayload {
  title: string;
  description?: string;
}

export interface IPermissionPayload {
  title: string;
  description?: string;
}
export interface IUserRolePayload {
  userId: string;
  roleId: string;
}

export interface IRolePermissionPayload {
  roleId: string;
  permissionId: string;
}

export interface IRole {
  _id?: Types.ObjectId;
  title: string;
  description?: string;
  isActive: boolean;
}

export interface IPermission {
  _id?: Types.ObjectId;
  title: string;
  description?: string;
  isActive: boolean;
}

export interface IUserRole {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  roleId: Types.ObjectId;
  isActive: boolean;
}

export interface IRolePermission {
  _id?: Types.ObjectId;
  roleId: Types.ObjectId;
  permissionId: Types.ObjectId;
  isActive: boolean;
}






// // src/interfaces/IRbacService.ts 
// export class RoleResponse {  
//   roleId!: string;
//   title!: string;
//   description!: string;
//   isActive!: boolean;

// import { Types } from "mongoose";

//   constructor() {}  // Required for mapper
// }

// export class PermissionResponse {  
//   permissionId!: string;
//   title!: string;
//   description!: string;
//   isActive!: boolean;

//   constructor() {}
// }

// export class UserResponse {
//   userId!: string;
//   name!: string;
//   email!: string;

//   constructor() {}
// }

// export class UserPermissionsResponse {
//   user?: UserResponse;
//   permissions: PermissionResponse[];

//   constructor() {
//     this.permissions = [];
//   }
// }

// export class UserRolesResponse {
//   user?: UserResponse;
//   Roles: RoleResponse[];  

//   constructor() {
//     this.Roles = [];
//   }
// }

// // Payloads stay as interfaces (no mapping needed)
// export interface IRolePayload {
//   title: string;
//   description?: string;
// }

// export interface IPermissionPayload {
//   title: string;
//   description?: string;
// }

// export interface IUserRolePayload {
//   userId: string;
//   roleId: string;
// }

// export interface IRolePermissionPayload {
//   roleId: string;
//   permissionId: string; 
// }


// export interface IRbacService {
//   getRoles(id?: string): Promise<RoleResponse[]>;  
//   getPermissions(id?: string): Promise<PermissionResponse[]>;
//   getUserPermissions(userId?: string): Promise<UserPermissionsResponse[]>;
//   getUserRoles(userId?: string): Promise<UserRolesResponse[]>;  
//   createRole(payload: IRolePayload): Promise<RoleResponse>;
//   createPermission(payload: IPermissionPayload): Promise<PermissionResponse>;
//   assignRoleToUser(payload: IUserRolePayload): Promise<void>;
//   assignPermissionToRole(payload: IRolePermissionPayload): Promise<void>;
// }













