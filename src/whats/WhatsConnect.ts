  import makeWASocket, {
    AnyMessageContent,
    delay,
    DisconnectReason,
    useMultiFileAuthState,
    proto,
    
  } from "@whiskeysockets/baileys";
  import { join } from "path";
  import { Boom } from "@hapi/boom";
  import { ConversationAI } from "@/Conversation/Conversation-Ai";
  import { onlyNumber } from "@/common/utis";
  import { UserPhone } from "@/UserPhones/UserPhones";
  import { FeedBackUser } from "@/feedback/FeedBack-User";



  export  class WhatsAppConnector {
    private sock: any;
    private conversation: ConversationAI;
    private userPhone: UserPhone
    private feedBack: FeedBackUser;

  
    constructor() {
      this.conversation = new ConversationAI(this.send);
      this.userPhone = new UserPhone();
      this.feedBack = new FeedBackUser(this.send ,this.conversation);
      this.conversation.setFeedBack(this.feedBack);
 

      
    } 
  
    async connect() {
      const {state, saveCreds} = await useMultiFileAuthState(join("baileys_auth_info"));
  
      const sock = (this.sock = makeWASocket({printQRInTerminal: true, auth: state}));
  
  
      sock.ev.on("connection.update",async (update) => {
          const { connection, lastDisconnect } = update;
          if (connection === "close") {
            const shouldReconnect =
              (lastDisconnect.error as Boom)?.output?.statusCode !==
              DisconnectReason.loggedOut;
            console.log(
              "connection closed due to ",
              lastDisconnect.error,
              ", reconnecting ",
              shouldReconnect
            );
            if (shouldReconnect) {
               await  this.connect();
            }
          } else if (connection === "open") {
            console.log("opened connection");

           // mandar('8681732880') caso eu mande
          }
        });
      
        // Evento de mensagem recebida
      
      
        sock.ev.on("messages.upsert",async (upsert) => {
          if (upsert.type === "notify"){
              for( const msg of upsert.messages){
                  if(!msg.key.fromMe && msg.message ){
                      this.handleMessage(msg);
                  }
              }
          }
  
      });
      sock.ev.on("creds.update", saveCreds);
  
      sock.ev.on("messages.media-update", (m) => {
        console.log("notify", m);
      });

     
  }

  
  async handleMessage(msg: proto.IWebMessageInfo) {
    await this.sock !.readMessages([msg.key]);
    const nameUser = msg.key.participant || msg.pushName;
    let text = msg.message.conversation || msg.message ?. extendedTextMessage ?. text || msg.message ?. buttonsResponseMessage ?. selectedButtonId || msg.message ?. listResponseMessage ?. singleSelectReply ?. selectedRowId;
    if (text && msg.key.remoteJid.endsWith("s.whatsapp.net")) {
        const phone = onlyNumber(msg.key.remoteJid);
       try{
        if(await this.userPhone.existPhone(phone)){
          if(this.conversation.closeOfTrue()){
              this.feedBack.answer(phone,text,nameUser)
              this.userPhone.deletePhone(phone);
              this.conversation.restartSession(false);
          }

         else  if(this.conversation.returnMessageToAsk()){
              this.feedBack.ask(phone,text);

          }

          else{ 
            await this.conversation.answer(phone,text);
          }
        }
        
       else{
        await this.userPhone.addPhoneUser(phone);
        await this.conversation.ask(phone);
       }
       }
       catch(erro){
        console.log(erro);

       }

    }
  }

  
     send=async(id: string, message: AnyMessageContent)=> {
      id = "55" + id + "@s.whatsapp.net";
      await this.sock.presenceSubscribe(id);
      await delay(500);
      await this.sock.sendPresenceUpdate("composing", id);
      await delay(500);
      return await this.sock.sendMessage(id, message);
    }

  }


  
  
  
  