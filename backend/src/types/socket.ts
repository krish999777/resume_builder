import {verifyToken} from '../utils/jwt'
import {parseCookie} from 'cookie'
import {prisma} from '../lib/prisma'
import  type { Server } from 'socket.io'

export function initSocket(io:Server){
    io.use((socket,next)=>{
        const rawCookie=socket.handshake.headers.cookie
        if(!rawCookie){
            return next(new Error('Cookie not sent'))
        }
        const cookie=parseCookie(rawCookie)
        const token=cookie.token
        if(!token){
            return next(new Error('Cookie does not contain token'))
        }
        const payload=verifyToken(token)
        if(!payload){
            return next(new Error('Not valid'))
        }
        socket.data.role=payload.role
        socket.data.id=payload.id
        next()
    })
    io.on("connection",async (socket)=>{
        console.log("A client connected!")
        const id=socket.data.id
        const role=socket.data.role
        try{
            const conversations=await prisma.conversation.findMany({
                where:{
                    recruiterId:role==='recruiter'?id:undefined,
                    candidateId:role==='candidate'?id:undefined
                },
                select:{
                    id:true
                }
            })
            socket.join(conversations.map(convo=>`conversation:${convo.id}`))
        }catch(err){
            console.log(err)
            socket.disconnect()
        }
        socket.on('sendMessage',async (data:{
            conversationId:number,
            message:string
        })=>{
            if(!data||!data.conversationId||!data.message){
                return socket.emit('error', { message: 'Unauthorized' })
            }
            try{
                const date=new Date()
                const response=await prisma.$transaction(async (tx)=>{
                    const convo=await tx.conversation.findFirst({
                        where:{id:data.conversationId,OR:[{candidateId:socket.data.id},{recruiterId:socket.data.id}]},
                        select:{id:true}
                    })
                    if(!convo){
                        throw new Error('Convesation not found or user not in conversation')
                    }
                    await tx.conversation.update({
                        where:{id:data.conversationId},
                        data:{
                            lastMessagedAt:date,
                            messages:{
                                create:{
                                    message:data.message,
                                    senderId:socket.data.id,
                                    sentAt:date,
                                }
                            }
                        }
                    })
                })
                io.to(`conversation:${data.conversationId}`).emit('recieveMessage',{
                    message:data.message,
                    senderId:socket.data.id,
                    conversationId:data.conversationId
                })
            }catch(err){
                return socket.emit('error', { message: 'Error in updating db or emitting message' })
            }
        })
        socket.on('typingSender',async ({conversationId}:{conversationId:number})=>{
            const isConversation=socket.rooms.has(`conversation:${conversationId}`)
            if(!isConversation){
                socket.emit('error',{message:"User is not part of the conversation"})
                return
            }
            socket.to(`conversation:${conversationId}`).emit('typingReciever',{conversationId})
        })
    })
}