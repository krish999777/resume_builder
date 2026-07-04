import type {Request,Response} from 'express'
import * as z from 'zod'
import {prisma} from '../lib/prisma'
import {io} from '../server'

export async function postConversation(req:Request,res:Response){
    const {userId}=req.body
    const id=req.id
    const result=z.int().safeParse(userId)
    if(!result.success){
        return res.status(400).json({error:"Invalid userId"})
    }
    try{
        const candidate=await prisma.user.findFirst({
            where:{
                id:result.data,
                role:'candidate'
            },
            select:{id:true}
        })
        if(!candidate){
            return res.status(400).json({error:"userId must exist and should be of candidate only"})
        }
        const conversation=await prisma.conversation.upsert({
            where:{
                recruiterId_candidateId:{
                    recruiterId:id!,
                    candidateId:result.data
                }
            },
            create:{
                candidateId:result.data,
                recruiterId:id!,
            },
            update:{},
            select:{id:true}
        })
        io.sockets.sockets.forEach(socket=>{
            if(socket.data.id===id||socket.data.id===result.data){
                socket.join(`conversation:${conversation.id}`)
            }
        })
        return res.status(200).json({conversationId:conversation.id})
    }catch(err){
        console.log(err)
        return res.status(500).json({error:'Internal server error'})
    }
}

export async function getConversation(req:Request,res:Response){
    const id=req.id!
    const role=req.role!
    try{
        if (role === 'candidate') {
            const user = await prisma.user.findUnique({
                where: { id },
                select: {
                    conversationsAsCandidate: {
                        select: {id:true, recruiter: { select: { name: true } }, lastMessagedAt: true },
                        orderBy:{lastMessagedAt:'desc'}
                    }
                }
            })
            if (!user) return res.status(400).json({error: "User not found"})
            const data = user.conversationsAsCandidate.map(conv => ({
                id:conv.id,
                name: conv.recruiter.name,
                lastMessagedAt: conv.lastMessagedAt
            }))
            return res.status(200).json({data})
        }

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                conversationsAsRecruiter: {
                    select: { id:true,candidate: { select: { name: true } }, lastMessagedAt: true },
                    orderBy:{lastMessagedAt:'desc'}
                }
            }
        })
        if (!user) return res.status(400).json({error: "User not found"})
        const data = user.conversationsAsRecruiter.map(conv => ({
            id:conv.id,
            name: conv.candidate.name,
            lastMessagedAt: conv.lastMessagedAt
        }))
        return res.status(200).json({data})
    }catch(err){
        console.log(err)
        return res.status(500).json({error:"Internal server error"})
    }
}

export async function getEachConversation(req:Request,res:Response){
    const userId=req.id!
    const paramsId=req.params.id
    const result=z.coerce.bigint().safeParse(paramsId)
    if(!result.success){
        return res.status(400).json({error:"Id must be a a valid number"})
    }
    const id=Number(result.data)
    try{
        const messages=await prisma.conversation.findUnique({
            where:{id,OR:[{candidateId:userId},{recruiterId:userId}]},
            select:{
                messages:{
                    select:{
                        id:true,
                        message:true,
                        sentAt:true,
                        sender:{
                            select:{
                                id:true,
                                name:true,
                                profileUrl:true
                            }
                        }
                    },
                    orderBy:{sentAt:'asc'}
                }
            }
        })
        if(!messages){
            return res.status(404).json({error:"Conversation not found"})
        }
        const flattenedMessages=messages.messages.map(mes=>({
            id:mes.id,
            senderId:mes.sender.id,
            message:mes.message,
            sentAt:mes.sentAt,
            name:mes.sender.name,
            profileUrl:mes.sender.profileUrl
        }))
        return res.status(200).json({data:flattenedMessages})
    }catch(err){
        console.log(err)
        res.status(500).json({error:"Internal server error"})
    }
}