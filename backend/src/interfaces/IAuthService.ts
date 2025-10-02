//src/interfaces/IAuthservice.ts
export interface IAuthService {
  login(palylod: ILoginPayload): Promise<ITokenResponse>;
  register(palylod: IRegisterPayload): Promise<ITokenResponse>;
  logout(userId: string): Promise<void>;
  validateToken(token: string): Promise<any>;
}

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IRegisterPayload extends ILoginPayload {
  name: string;
}

export interface IUser extends IRegisterPayload {
  id?: string;
}

export interface ITokenResponse extends IUser {
  token: string;
}
