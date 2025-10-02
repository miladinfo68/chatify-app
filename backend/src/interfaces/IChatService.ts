export interface IChatService{
  send(paylod: IMessagePayload): Promise<IMessagePayload>;
}

export interface IMessagePayload{
    message:string,
    time? :string
}
