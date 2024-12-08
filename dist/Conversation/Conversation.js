"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildConversations = void 0;
const Conversation_Ai_1 = require("./Conversation-Ai");
const buildConversations = (send) => {
    const aiConversationAgente = new Conversation_Ai_1.ConversationAI(send);
    return { aiConversationAgente };
};
exports.buildConversations = buildConversations;
//# sourceMappingURL=Conversation.js.map