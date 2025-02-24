import path from "path"
import fs from "fs/promises"
import os from "os"



export class UserPhone{
    private phone: Set<string>;

    constructor(){
        this.phone = new Set();
    }

    async existPhone(id:string):Promise<boolean>{
      return this.phone.has(id);
    }
   async addPhoneUser(id:string){
    if (!this.phone.has(id)) {
      this.phone.add(id); 
      console.log(this.phone);
      const directory = path.join(process.cwd());
      const fileName = path.join(directory, "knowPhones")
      const file = await fs.open(fileName, "a+");
      await file.write(id+os.EOL);
      await file.close();
  }        
   }

   async deletePhone(id:string){
      await this.phone.delete(id);
        console.log(this.phone);

   }
}