
import { TypeSend } from "./TypeSend";
import { IConversation } from "./IConversation";
import { text } from "stream/consumers";


const fs = require('fs').promises;
const path = require('path');

const api_key = "AIzaSyB2PUsUN5vt36v7pq_9T6tKdrYupporoQk"
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
         
    async readInformation() {
      try {
        const filePath = path.resolve(__dirname, '..', 'information_ifpi', 'Information.json');
        const file = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(file);
        const parts: string[] = [];
    
        if (Array.isArray(data)) {
          data.forEach((pageContent, index) => {
            parts.push(`--- PAGE ${index} ---\n${JSON.stringify(pageContent, null, 2)}`);
          });
        } else {
          parts.push("--- PAGE 0 ---\n" + JSON.stringify(data, null, 2));
        }
    
        return parts.join("\n\n");  
      } catch (erro) {
        throw erro;
      }
    }
    

    async createChat(){
      const chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [
              {
                text: await this.readInformation()
              }
            ]
        },
          {
            role:"user",
            parts:[{text:"responda todas as perguntas em português, seja gentil, você irá responder  as perguntas com base nas informções passadas anteriores use emojis "}]
          },
 
        ],
        generationConfig: {
          temperature:1.0
        },
      })
      return chat;
    }


    

    async ask(id:string){
          try{
            await this.send(id,{text:'Olá!  Sou o seu guia virtual no IFPI. Posso te ajudar a encontrar informações importantes sobre a instituição, como disciplinas, projetos e eventos. ️ O que você gostaria de saber?'});
            console.log(id);

          }catch(error){
            console.log('erro' , error);
          }
      }

    async answer(id: string,message:string) {
      
        try {
          if(message ==="não"){
            
          }
          else{
            const chat = this.sessions[id]= this.sessions[id]|| await this.createChat();
            const result = await chat.sendMessage(message);
            const jsonString = JSON.stringify(result.response.text());
            const jsonStringReplace= jsonString.replace(/\\n/g, '\n').replace(/['"]+/g, '');
            await this.send(id,{text:jsonStringReplace} );
            const messageContinue = "Se você deseja continua com a conversa pode perguntar caso contrario você digite não";
            await this.send(id,{text:messageContinue});
          }
        } catch (error) {
          console.error(error);
          await this.send(id,{text:"Ops!! estamos com problemas tecnicos tente mais tarde"})
        }
      }
      

}