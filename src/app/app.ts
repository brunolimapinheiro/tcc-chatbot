require('dotenv').config()
import  {WhatsAppConnector}  from "@/whats/WhatsConnect";


 
async function main(){
    const whatsAppConnector = new WhatsAppConnector( );
    await whatsAppConnector.connect();
}
main();
