// src/services/ChatService.ts
import { IMessagePayload, IChatService } from "../interfaces/IChatService.js";

export class ChatService implements IChatService {
  async send(payload: IMessagePayload): Promise<IMessagePayload> {
    payload.time = Date.now().toLocaleString();
    return payload;
  }
}
