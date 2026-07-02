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
    })
}