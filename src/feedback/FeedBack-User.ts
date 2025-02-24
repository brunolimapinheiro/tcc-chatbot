
import { MongoDBConnection } from "@/database/MongoDBConnection";
import { IConversation } from "../Conversation/IConversation";
import { TypeSend } from "../Conversation/TypeSend";
import { UserPhone } from "../UserPhones/UserPhones";
import { ConversationAI } from "@/Conversation/Conversation-Ai";

require('dotenv').config()

export class FeedBackUser implements IConversation{

    private send : TypeSend;
    private userPhone: UserPhone;
    private db:MongoDBConnection;
    private url:string;
    private firstQuestion:string;
    private secondQuestion:string;
    private conversation: ConversationAI;
    private responseFirstQuestion:boolean;
    private responseSecondQuestion:boolean;

    constructor(send : TypeSend, conversation:ConversationAI){
        this.send = send;
        this.userPhone = new UserPhone();
        this.url = process.env.MONGODB;
        this.db = new MongoDBConnection(this.url);
        this.conversation = conversation;
        this.responseFirstQuestion = false;
        this.responseSecondQuestion = false;
       

    }



   async ask(id: string,message:string) {
    if(message=="avaliar" || message=="Avaliar"|| message==="Avaliação"){
        await this.send(id,{text:"Você achou mais facil achar as informações pelo próprio chatbot ou nas plataformas que estão disponiveis essas informações? RESPONDA com a palavra chatbot ou plataformas do ifpi"});
        
    }

   else if(message=="chatbot" || message=="plataformas do ifpi"|| message=="Chatbot" || message=="Plataformas do IFPI" ||message=="Plataformas do ifpi "|| message=="IFPI " || message=="ifpi"){
    this.responseFirstQuestion= true;
    this.firstQuestion = message;
    await this.send(id,{text:"Você recomendaria o chatbot para outros alunos? RESPONDA com a palavra sim ou não"});
    
   }

   else if(message=="sim"||message=="nao"|| message=="Sim"|| message =="Nao"|| message=="não" || message=="Não"){
        this.responseSecondQuestion = true;
        this.secondQuestion = message;
        await this.send(id,{text:"Gostaríamos de saber como foi sua experiência conosco. Por favor, avalie nosso chatbot de 1 a 10,  sendo 1  para Péssimo e  10 para Excelente. Sua opinião é muito importante para nós!"})
        this.conversation.setMessageAsk(false);
        this.conversation.setCloseConversation(true);
    } 
    else{
        await this.send(id,{text:"Ops! não entendi, por favor responda a pergunta corretamente"})
        if(!this.responseFirstQuestion){
            message = "avaliar";
            this.ask(id,message);                       
        }
        else if(!this.responseSecondQuestion){
           message = "chatbot";
           this.ask(id,message);
        }
    }
   
}
    async answer(id: string,message:string,name:string) {
        await this.send(id, { text: "Muito obrigado por nos dar sua opinião! 😊 A sua avaliação nos ajuda a melhorar continuamente nossos serviços. 👍 Se precisar de mais alguma coisa, não hesite em nos procurar. Até a próxima e bons estudos! 📚" });
        this.db.insert(name,message,this.firstQuestion,this.secondQuestion);
        this.db.close();
        this.userPhone.deletePhone(id);
        this.responseFirstQuestion = false;
        this.responseSecondQuestion = false;
    }
}