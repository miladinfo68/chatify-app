// src/services/PasswordManagerService.ts
import bycript from "bcryptjs";
import { IPasswordManagerService } from "../interfaces/IPasswordManagerService.js";

export class PasswordManagerService implements IPasswordManagerService {

  async hashPassword(planePassword: string): Promise<string> {
    const salt = await bycript.genSalt(10);
    const hashedPassword = await bycript.hash(planePassword, salt);
    return hashedPassword;
  }

  async verifyPassword(planPassword: string ,hashedPassword:string): Promise<boolean> {
    return bycript.compare(planPassword, hashedPassword);
  }
}
