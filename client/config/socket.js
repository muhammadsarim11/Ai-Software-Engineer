import socket from 'socket.io-client'

let socketInstance = null

export const initiateSocket= (projectID)=>{

    socketInstance = socket('http://localhost:3000',{
        auth:{
            token: localStorage.getItem('token')
        },
        query:{
            projectID
        }
    })

return socketInstance

}

export const recievedMessage = (eventName , cb)=>{

    socketInstance.on(eventName,cb)

}


export const sendMessage = (eventName , data)=>{
    if(socketInstance){
        socketInstance.emit(eventName,data)
    }
}