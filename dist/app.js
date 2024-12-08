"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const baileys_1 = __importStar(require("@whiskeysockets/baileys"));
const path_1 = require("path");
const generative_ai_1 = require("@google/generative-ai");
async function connectToWhatsApp() {
    const { state, saveCreds } = await (0, baileys_1.useMultiFileAuthState)((0, path_1.join)("auth_info"));
    const sock = (0, baileys_1.default)({
        auth: state,
        printQRInTerminal: true,
    });
    const message = "ola o que posso fazer";
    async function send(id, message) {
        id = "55" + id + "@s.whatsapp.net";
        await sock.presenceSubscribe(id);
        await (0, baileys_1.delay)(500);
        await sock.sendPresenceUpdate("composing", id);
        await (0, baileys_1.delay)(500);
        return await sock.sendMessage(id, message);
    }
    async function getAi(message, id) {
        try {
            const api_key = 'AIzaSyDYVncGtq-E3DX4t8lv60Hqxs2h3xc79oM';
            const genAI = new generative_ai_1.GoogleGenerativeAI(api_key);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(message);
            const jsonString = JSON.stringify(result.response.text());
            const formatText = jsonString.replace(/\\n/g, '\n').replace(/['"]+/g, '');
            const responseText = { text: formatText };
            await send(id, responseText);
            console.log('mensagem enviada');
        }
        catch (error) {
            const message2 = 'problemas tecnicos';
            const responseT = { text: message2 };
            console.log(error);
            send(id, responseT);
        }
    }
    async function mandar(phone, text) {
        const response = "sua mensagem esta respondida";
        console.log(text);
        const responseText = { text: response };
        await send(phone, responseText);
    }
    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !==
                baileys_1.DisconnectReason.loggedOut;
            console.log("connection closed due to ", lastDisconnect.error, ", reconnecting ", shouldReconnect);
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        }
        else if (connection === "open") {
            console.log("opened connection");
        }
    });
    sock.ev.on("messages.upsert", async (upsert) => {
        if (upsert.type === "notify")
            for (const msg of upsert.messages) {
                if (!msg.key.fromMe && msg.message)
                    processMessage(msg);
            }
    });
    sock.ev.on("messages.media-update", (m) => {
        console.log("notify", m);
    });
    sock.ev.on("creds.update", saveCreds);
    async function processMessage(msg) {
        await sock.readMessages([msg.key]);
        let text = msg.message.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.buttonsResponseMessage?.selectedButtonId ||
            msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId;
        if (text && msg.key.remoteJid.endsWith("s.whatsapp.net")) {
            const phone_number = onlyNumber(msg.key.remoteJid);
            console.log(phone_number);
            getAi(text, phone_number);
        }
    }
}
function onlyNumber(jid) {
    const phone = jid.slice(2, 12);
    return phone;
}
connectToWhatsApp();
//# sourceMappingURL=app.js.map