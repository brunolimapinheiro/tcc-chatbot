import makeWASocket, {
    AnyMessageContent,
    delay,
    DisconnectReason,
    useMultiFileAuthState,
    proto,
  } from "@whiskeysockets/baileys";
  import { join } from "path";
  import { Boom } from "@hapi/boom";
  import { GoogleGenerativeAI } from "@google/generative-ai";
  
  
  
  
  
  async function connectToWhatsApp() {
    // Inicializa a autenticação e a instância do Baileys
    const { state, saveCreds } = await useMultiFileAuthState(join("auth_info"));
    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: true,
    });
  
    // Função para enviar mensagens
    const message = "ola o que posso fazer";
    async function send(id: string, message: AnyMessageContent) {
      id = "55" + id + "@s.whatsapp.net";
      await sock.presenceSubscribe(id);
      await delay(500);
      
      await sock.sendPresenceUpdate("composing", id);
      await delay(500);
      return await sock.sendMessage(id, message);
    }
  
    

  
  
  
    // Função para obter a resposta da API AI
    async function getAi(message: string,id:string) {
      try{
        const api_key ='AIzaSyDYVncGtq-E3DX4t8lv60Hqxs2h3xc79oM' ;
        const genAI = new GoogleGenerativeAI(api_key);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(message);
        const jsonString = JSON.stringify(result.response.text())
        const formatText =  jsonString.replace(/\\n/g, '\n').replace(/['"]+/g, '');
        const responseText: AnyMessageContent = { text: formatText };
        await send(id, responseText);
        console.log('mensagem enviada')
      }
        catch(error){
          const message2 = 'problemas tecnicos';
          const responseT:AnyMessageContent = {text:message2}
          console.log(error)
          send(id,responseT);
        }
  
   
    }
  
    async function mandar(phone: string,text:string) {
      const response = "sua mensagem esta respondida";
      console.log(text)
      const responseText: AnyMessageContent = { text: response };
      await send(phone, responseText);
    }
  
    // Evento de atualização de conexão
    sock.ev.on("connection.update", (update) => {
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
          connectToWhatsApp();
        }
      } else if (connection === "open") {
        console.log("opened connection");
       // mandar('8681732880') caso eu mande
      }
    });
  
    // Evento de mensagem recebida
  
  
    sock.ev.on("messages.upsert",async (upsert) => {
      if (upsert.type === "notify")
        for (const msg of upsert.messages){
       if (!msg.key.fromMe && msg.message) processMessage(msg);
  
        }
         
          
    });
  
    sock.ev.on("messages.media-update", (m) => {
      console.log("notify", m);
    });
  
    // Atualiza as credenciais quando necessário
    sock.ev.on("creds.update", saveCreds);
    async function processMessage(msg: proto.IWebMessageInfo) {
      await sock!.readMessages([msg.key]);
  
      let text =
        msg.message.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.buttonsResponseMessage?.selectedButtonId ||
        msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId;
  
      if (text && msg.key.remoteJid.endsWith("s.whatsapp.net")) {     
        const phone_number = onlyNumber(msg.key.remoteJid);
        console.log(phone_number);
          getAi(text,phone_number)
        //await this.read(phone_number, {text, timestamp: msg.messageTimestamp as number});
      }
    }
  
  }
  
  function onlyNumber(jid: string): string {
    const phone = jid.slice(2, 12);
    return phone;
  }
  
  // Executa a função principal
  connectToWhatsApp();
  