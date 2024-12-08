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
  import path from "path"
  import fs from "fs/promises"
  import os from "os"
  
  
  export  class WhatsAppConnector {
    private sock: any;
    private conversation: ConversationAI;
    private knowPhones : Set<string>;
  
    constructor() {
      this.conversation = new ConversationAI(this.send);
      this.knowPhones =new Set();
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
    let text = msg.message.conversation || msg.message ?. extendedTextMessage ?. text || msg.message ?. buttonsResponseMessage ?. selectedButtonId || msg.message ?. listResponseMessage ?. singleSelectReply ?. selectedRowId;
    if (text && msg.key.remoteJid.endsWith("s.whatsapp.net")) {
        const phone = onlyNumber(msg.key.remoteJid);
        if(this.knowPhones.has(phone)){
          await this.conversation.answer(phone,text);
        }
       else{
        await this.savePhone(phone); 
        await this.conversation.ask(phone);
       }
  
    }
  }
  
    async savePhone(phone:string){ //carregar o arquivo kwonPhone
      this.knowPhones.add(phone);
      const directory = path.join(process.cwd());
      const fileName = path.join(directory, "knowPhones")
  
      const file = await fs.open(fileName, "a+");
     
  
  
      await file.write(phone+os.EOL);
      await file.close();
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
  
  