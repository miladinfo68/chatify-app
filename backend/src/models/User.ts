//src/models/User.ts

import { Document, model, Schema, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
//   avatar?: string;
//   isOnline: boolean;
//   lastSeen: Date;
//   createdAt: Date;
//   updatedAt: Date;
//   comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      trim: true,
      minLength: 2,
      maxLength: 200,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      trim: true,
      maxLength: 200,
    },
    password: {
      type: String,
      required: [true, "password is required"],
      minLength: 3,
      maxLength: 200,
    },
    // avatar: {
    //   type: String,
    //   default: null
    // },
    // isOnline: {
    //   type: Boolean,
    //   default: false
    // },
    // lastSeen: {
    //   type: Date,
    //   default: Date.now
    // }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret: Record<string, any>) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },
    toObject: {
      transform: (doc, ret: Record<string, any>) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },
  }
);

// userSchema.index({ email: 1 });
// userSchema.index({ isOnline: 1 });
userSchema.index({ createdAt: -1 });

// userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
//   // This will be implemented after we add bcrypt
//   return candidatePassword === this.password; 
// };

// // Pre-save middleware to hash password (we'll implement this later)
// userSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
//   // Password hashing will be added here
//   next();
// });

export const User = model<IUser>('User', userSchema);