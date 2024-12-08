
import { TypeSend } from "./TypeSend";
import { IConversation } from "./IConversation";

;

const api_key = process.env.GEMINI_API_KEY;
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(api_key);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });




export class ConversationAI implements IConversation{
    private send : TypeSend;
    private sessions: {
      [key: string]: any
    }
    constructor(send:TypeSend ){
      this.send = send
      this.sessions = {}
    }


  

     createChat(){
      const chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [{text:"ola meu nome é bruno"}],
          },
          {
            role: "model",
            parts: [{text:"ola bruno"}],
          },
        
        ],
        generationConfig: {
          maxOutputTokens: 100,
        },
      })
      return chat;
    }





    async ask(id:string){
          try{
            await this.send(id,{text:'ola o que voce deseja?'});

          }catch(error){
            console.log('erro' , error);
          }
    }



    async answer(id: string,message:string): Promise<string> {
      
        try {
        
          const chat = this.sessions[id]= this.sessions[id]|| this.createChat();
          const result = await chat.sendMessage(message);
          const jsonString = JSON.stringify(result.response.text());
          const jsonStringReplace= jsonString.replace(/\\n/g, '\n').replace(/['"]+/g, '');
          await this.send(id,{text:jsonStringReplace} );
        } catch (error) {
          console.error(error);
          return 'Problemas técnicos.';
        }
      }
      

}