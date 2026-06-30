import type {Request,Response} from 'express'
import * as z from 'zod'
import {prisma} from '../lib/prisma'

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
        return res.status(200).json({conversationId:conversation.id})
    }catch(err){
        console.log(err)
        return res.status(500).json({error:'Internal server error'})
    }
}