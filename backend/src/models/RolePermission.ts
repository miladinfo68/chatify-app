// src/models/RolePermission.ts

import { Schema, model, Document, Types } from 'mongoose';
import { IRole } from './Role.js';
import { IPermission } from './Permission.js';

export interface IRolePermission extends Document {
  roleId: Types.ObjectId | IRole;
  permissionId: Types.ObjectId | IPermission;
  isActive: boolean;
}

const rolePermissionSchema = new Schema<IRolePermission>(
  {
    roleId: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
    },
    permissionId: {
      type: Schema.Types.ObjectId,
      ref: 'Permission',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Ensure unique role-permission pairs
rolePermissionSchema.index({ roleId: 1, permissionId: 1 }, { unique: true });

export default model<IRolePermission>('RolePermission', rolePermissionSchema);