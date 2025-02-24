
import { TypeSend } from "./TypeSend";
import { IConversation } from "./IConversation";
import { FeedBackUser } from "../feedback/FeedBack-User";
import { UserPhone } from "@/UserPhones/UserPhones";


const fs = require('fs').promises;
const path = require('path');

require('dotenv').config()
const api_key = process.env.GEMINI_API_KEY;
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(api_key);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


export class ConversationAI implements IConversation{
  private send: TypeSend;
  private closeConversation: boolean;
  private messageAsk: boolean;
  private feedBack:FeedBackUser;

  constructor(send: TypeSend) {
      this.send = send;
      this.closeConversation = false;
      this.messageAsk = false;

  }

  setMessageAsk(value: boolean) {
      this.messageAsk = value;
  }


  setFeedBack(feedBack: FeedBackUser) {
    this.feedBack = feedBack;
}

    setCloseConversation(flak:boolean){
      this.closeConversation = flak;
    }

    closeOfTrue(){
      return this.closeConversation== true;
    }

    restartSession(value:boolean){
      this.closeConversation = value;
    }
    returnMessageToAsk(){
      return this.messageAsk==true
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
            parts:[{text:"responda todas as perguntas em português, seja gentil, você irá responder  as perguntas com base nas informções passadas anteriores, caso você não tenha dados para a pergunta você responde que ainda não tenho essa informações pois ainda estamos em desenvolvimento mas você vai ficar feliz se poder ajudar em algo mais, se alguem falar sobre processar algum professor ou algum ofensa, ache graça e fale que não seria legal fazer isso, use emojis "}]
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
            await this.send(id,{text:'Olá! Sou o seu guia virtual no IFPI. Posso te ajudar a encontrar informações importantes sobre a instituição, como atividades complementares,e-mails especificos para entrar em contato com os setores do ifpi , declaração de matricula entre outros . ️ O que você gostaria de saber?'});
            console.log(id);

          }catch(error){
            console.log('erro' , error);
          }
      }

    async answer(id: string,message:string) {
      
        try {
          if(message ==="avaliar" || message ==="Avaliar"|| message==="Avaliação") { 
            this.feedBack.ask(id,message);
            this.messageAsk = true;
          }
          else if(message==="breno"){
            await this.send(id, {text:"Parabens você descobriu um easter egg  , você é um verdadeiro hacker  "});
        
          }
          else if(message=="teste"){
            await this.send(id, {text:"esse é um teste"});
          }
       
          else{
            try{
            const chat =  await this.createChat();
            const result = await chat.sendMessage(message);
            const jsonString = JSON.stringify(result.response.text());
            const jsonStringReplace= jsonString.replace(/\\n/g, '\n').replace(/['"]+/g, '');
            await this.send(id,{text:jsonStringReplace} );
            const messageContinue = "Se você deseja continuar com a conversa, pode fazer sua pergunta, caso contrario você pode DIGITAR: Avaliar, para terminar a conversa";
            await this.send(id,{text:messageContinue});
            }
            catch(erro){
              console.log('erro' , erro);
              await this.send(id,{text:"Ops!! algo de errado não está certo, estamos com alguns problemas, se você poder me mandar sua pergunta novamente eu vou tentar ajudar"});
            }
          }
        } catch (error) {
          console.error(error);
          await this.send(id,{text:"Ops!! estamos com problemas tecnicos tente mais tarde"})
        }
      }
      

}