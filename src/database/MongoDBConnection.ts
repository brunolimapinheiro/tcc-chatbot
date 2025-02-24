import { MongoClient} from "mongodb"
import { DataBase } from "./DataBase";


export class MongoDBConnection  implements DataBase {
    private client: MongoClient;

  constructor(url:string){
    this.client = new MongoClient(url,{monitorCommands:true});
  }

  async connect() {
    try{
      this.client.on('commandStarted', started => console.log(started))
      console.log("conexão feita com sucesso!!")
    }
    catch(erro){
      console.log("erro ao conectar ao banco de dados", erro);
    }
  }

  async insert(name:string,avaliation:string, firstQuestion:string,secondQuestion:string){
    try{
      const dataBase = this.client.db('dadosDeAlunos');
      const collection = dataBase.collection('alunos');
      const result =  await collection.insertOne({
         name: name,
         avaliation:avaliation,
         firstQuestion: firstQuestion,
         secondQuestion:secondQuestion,
         date: new Date()
      })
      console.log("aluno inserido com sucesso!!", result.insertedId);
    }
    catch(erro){
      console.log("erro ao inserir aluno", erro);
    }
  }

  async close(){
    try{
      this.client.close();
      console.log("conexão fechada com sucesso!!");
    }
    catch(erro){
      console.log(erro);
    }
  }
}