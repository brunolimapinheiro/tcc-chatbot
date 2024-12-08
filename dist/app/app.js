"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const WhatsConnect_1 = require("@/whats/WhatsConnect");
async function main() {
    const whatsAppConnector = new WhatsConnect_1.WhatsAppConnector();
    await whatsAppConnector.connect();
}
main();
//# sourceMappingURL=app.js.map