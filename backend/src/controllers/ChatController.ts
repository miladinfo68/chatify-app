import { Request, Response } from "express";
import { IChatService } from "../interfaces/IChatService.js";
import { ApiResponse } from "../utils/apiResponse.js";

export class ChatController {
  constructor(private messageService: IChatService) {}

  send = async (req: Request, res: Response) => {
    const message = req.query?.message as string;
    // console.log("222222",message)
    const result = await this.messageService.send({message});
    // console.log("11000",result)
    const response = ApiResponse.success(result, "");
    res.status(response.status).json(response);
  };
}
