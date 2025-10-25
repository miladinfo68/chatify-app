// src/models/Permission.ts

import { Schema, model, Document } from 'mongoose';

export interface IPermission extends Document {
  title: string;
  description?: string;
  isActive: boolean;
}

const permissionSchema = new Schema<IPermission>(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default model<IPermission>('Permission', permissionSchema);