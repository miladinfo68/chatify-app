// src/routes/ChatRoutes.ts

import { Router } from "express";
import { ChatController } from "../controllers/ChatController.js";
import { IChatService } from "../interfaces/IChatService.js";

export class ChatRoutes {
  private router: Router;
  private chatController: ChatController;
  constructor(private chatService: IChatService) {
    this.router = Router();
    this.chatController = new ChatController(chatService);
    this.setupRoutes();
  }

  private setupRoutes() {
    this.router.get("/send", this.chatController.send);
  }

  public getRouter(): Router {
    return this.router;
  }
}

export const createChatRoutes = (chatService: IChatService): Router => {
  return new ChatRoutes(chatService).getRouter();
};
