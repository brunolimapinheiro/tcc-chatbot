

export interface IConversation{
    ask(
        id:string,
        text?:string,
        userName?:string
    )
    answer(
        id:string,
        texts?:string,
        name?:string

      )
}