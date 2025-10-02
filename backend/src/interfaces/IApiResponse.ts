//src/interfaces/IApiResponse.ts

export default interface IApiResponse<T> {
  data?: T;
  success: boolean; //default true
  status: number; //default 200
  message?: string; //default null
  timestamp: string; //Current Date
}
