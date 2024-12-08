import { WhatsAppConnector } from "@/whats/WhatsConnect";
import { TypeConvesations } from "./TypeConversations";
import { ConversationAI } from "./Conversation-Ai";
import { TypeSend } from "./TypeSend";


export const buildConversations = (
  send: TypeSend
): TypeConvesations => {
  
    const aiConversationAgente = new ConversationAI(send);

    return {aiConversationAgente}

};
