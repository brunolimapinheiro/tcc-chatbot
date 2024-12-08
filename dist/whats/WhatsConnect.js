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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppConnector = void 0;
const baileys_1 = __importStar(require("@whiskeysockets/baileys"));
const path_1 = require("path");
const Conversation_Ai_1 = require("@/Conversation/Conversation-Ai");
const utis_1 = require("@/common/utis");
const path_2 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const os_1 = __importDefault(require("os"));
class WhatsAppConnector {
    sock;
    conversation;
    knowPhones;
    constructor() {
        this.conversation = new Conversation_Ai_1.ConversationAI(this.send);
        this.knowPhones = new Set();
    }
    async connect() {
        const { state, saveCreds } = await (0, baileys_1.useMultiFileAuthState)((0, path_1.join)("baileys_auth_info"));
        const sock = (this.sock = (0, baileys_1.default)({ printQRInTerminal: true, auth: state }));
        sock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === "close") {
                const shouldReconnect = lastDisconnect.error?.output?.statusCode !==
                    baileys_1.DisconnectReason.loggedOut;
                console.log("connection closed due to ", lastDisconnect.error, ", reconnecting ", shouldReconnect);
                if (shouldReconnect) {
                    await this.connect();
                }
            }
            else if (connection === "open") {
                console.log("opened connection");
            }
        });
        sock.ev.on("messages.upsert", async (upsert) => {
            if (upsert.type === "notify") {
                for (const msg of upsert.messages) {
                    if (!msg.key.fromMe && msg.message) {
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
    async handleMessage(msg) {
        await this.sock.readMessages([msg.key]);
        let text = msg.message.conversation || msg.message?.extendedTextMessage?.text || msg.message?.buttonsResponseMessage?.selectedButtonId || msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId;
        if (text && msg.key.remoteJid.endsWith("s.whatsapp.net")) {
            const phone = (0, utis_1.onlyNumber)(msg.key.remoteJid);
            if (this.knowPhones.has(phone)) {
                await this.conversation.answer(phone, text);
            }
            else {
                await this.savePhone(phone);
                await this.conversation.ask(phone);
            }
        }
    }
    async savePhone(phone) {
        this.knowPhones.add(phone);
        const directory = path_2.default.join(process.cwd());
        const fileName = path_2.default.join(directory, "knowPhones");
        const file = await promises_1.default.open(fileName, "a+");
        await file.write(phone + os_1.default.EOL);
        await file.close();
    }
    send = async (id, message) => {
        id = "55" + id + "@s.whatsapp.net";
        await this.sock.presenceSubscribe(id);
        await (0, baileys_1.delay)(500);
        await this.sock.sendPresenceUpdate("composing", id);
        await (0, baileys_1.delay)(500);
        return await this.sock.sendMessage(id, message);
    };
}
exports.WhatsAppConnector = WhatsAppConnector;
//# sourceMappingURL=WhatsConnect.js.map