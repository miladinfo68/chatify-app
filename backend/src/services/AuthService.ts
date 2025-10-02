// src/services/AuthService.ts
import { User } from "../models/User.js";
import {
  IAuthService,
  ILoginPayload,
  IRegisterPayload,
  ITokenResponse,
  IUser,
} from "../interfaces/IAuthService.js";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/CustomError.js";

export class AuthService implements IAuthService {
  constructor() {}

  async login(payload: ILoginPayload): Promise<ITokenResponse> {
    console.log("login payload:", payload);
    const user = await User.findOne({ email: payload.email });
    if (!user) {
      throw new NotFoundError();
    }
    if (user.password !== payload.password) {
      throw new UnauthorizedError("Invalid Credential");
    }
    const userResponse: IUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      password: user.password,
    };
    return {
      ...userResponse,
      token: `token-${Date.now()}`,
    };
  }

  async register(payload: IRegisterPayload): Promise<ITokenResponse> {
    console.log("register payload:", payload);
    const existingUser = await User.findOne({ email: payload.email });
    if (existingUser) {
      throw new ConflictError();
    }
    const user = new User({
      name: payload.name,
      email: payload.email,
      password: payload.password,
    });

    await user.save();
    const userResponse: IUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      password: user.password,
    };
    return {
      ...userResponse,
      token: `token-${Date.now()}`,
    };
  }

  async logout(userId: string): Promise<void> {
    console.log("🚪 AuthService logout called:", userId);
    await new Promise((resolve) => setTimeout(resolve, 50));
    console.log("✅ User logged out:", userId);
  }

  async validateToken(token: string): Promise<any> {
    console.log("🔍 AuthService validateToken called:", token);
    await new Promise((resolve) => setTimeout(resolve, 50));

    if (token === "123ff") {
      return;
    } else {
      throw new Error("Invalid token");
    }
  }
}
