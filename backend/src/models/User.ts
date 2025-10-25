//src/models/User.ts

import { Document, model, Schema, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  lastLogout?: Date;
  //   isOnline: boolean;
  //   lastSeen: Date;
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
    avatar: {
      type: String,
      default: null,
    },
    lastLogout: {
      type: Date,
      default: null,
    },

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
  }
);

userSchema.index({ createdAt: -1 });

export default model<IUser>("User", userSchema);
