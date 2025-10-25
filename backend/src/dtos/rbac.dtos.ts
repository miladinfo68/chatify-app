// src/dtos/rbac.dtos.ts
export class RoleDto {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public isActive: boolean
  ) {}
}

export class PermissionDto {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public isActive: boolean
  ) {}
}

export class UserDto {
  constructor(
    public id: string,
    public name: string,
    public email: string,
    public avatar?: string
  ) {}
}

export class UserRolesDto {
  constructor(
    public user?: UserDto,
    public roles: RoleDto[] = []
  ) {}
}

export class UserPermissionsDto {
  constructor(
    public user?: UserDto,
    public permissions: PermissionDto[] = []
  ) {}
}