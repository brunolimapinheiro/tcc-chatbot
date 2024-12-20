import { IConversation } from "./IConversation";
import { TypeSend } from "./TypeSend";

export class FeedBackUser implements IConversation{

    private send : TypeSend;

    constructor(send : TypeSend){
        this.send = send;
    }

   async ask(id: string) {
    await this.send(id,{text:"avalie nosso chatBot der uma nota de 0 a 10 "});
    const date = new Date();
    }
    async answer(id: string, texts: string) {
        const rating = texts;
        await this.send(id, { text: "ok muito obrigado pela a sua avaliação para uma melhora do nosso chatBot" });
    }
}