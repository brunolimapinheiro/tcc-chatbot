import path from "path"
import fs from "fs/promises"
import os from "os"



export class UserPhone{
    private phone: Set<string>;

    constructor(){
        this.phone = new Set();
    }

   async addPhoneUser(id:string){
       this.phone.add(id);
          const directory = path.join(process.cwd());
          const fileName = path.join(directory, "knowPhones")
          const file = await fs.open(fileName, "a+");
          await file.write(id+os.EOL);
          await file.close();
   }

   async deletePhone(id:string){
    if(this.phone.has(id)){
        const directory = path.join(process.cwd());
          const fileName = path.join(directory, "knowPhones")
          const file = await fs.readFile(fileName, "utf-8");  
          const data = file.replace(id, "");
          await fs.writeFile(file,data);
    }
   }
}