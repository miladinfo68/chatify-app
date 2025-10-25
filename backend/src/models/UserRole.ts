// src/models/UserRole.ts

import { Schema, model, Document, Types } from 'mongoose';
import { IUser } from './User.js';
import { IRole } from './Role.js';

export interface IUserRole extends Document {
  userId: Types.ObjectId | IUser;
  roleId: Types.ObjectId | IRole;
  isActive: boolean;
}

const userRoleSchema = new Schema<IUserRole>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    roleId: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Ensure unique user-role pairs
userRoleSchema.index({ userId: 1, roleId: 1 }, { unique: true });

export default model<IUserRole>('UserRole', userRoleSchema);