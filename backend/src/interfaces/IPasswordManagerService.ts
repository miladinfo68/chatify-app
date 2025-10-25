export interface IPasswordManagerService {
  hashPassword(planPassword: string): Promise<string>;
  verifyPassword(planPassword: string,hassedPassword:string): Promise<boolean>;
}
