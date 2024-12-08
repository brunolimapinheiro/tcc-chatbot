import {  AnyMessageContent } from "@whiskeysockets/baileys";


export type TypeSend = (id: string, content: AnyMessageContent) => Promise<void>;