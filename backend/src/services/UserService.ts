// src/services/UserService.ts

import User, { IUser } from "../models/User.js";
import { BaseService } from "./BaseService.js";


class UserService extends BaseService<IUser> {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.findOne({ email });
  }

  async findByMobile(mobile: string): Promise<IUser | null> {
    return this.findOne({ mobile });
  }
}

export default new UserService();