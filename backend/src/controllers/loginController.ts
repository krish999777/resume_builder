import type {Request,Response} from 'express'
import * as z from 'zod'
import {prisma} from '../lib/prisma'
import bcrypt from 'bcrypt'
import {getToken} from '../utils/jwt'

const LoginSchema=z.object({
    email:z.email({
        error:"Email must be valid"
    }),
    password:z.string().min(7,{
        error:"Password must be atleast 7 characters"
    })
})

export async function loginController(req:Request,res:Response){
    const loginCreds=req.body
    const result=LoginSchema.safeParse(loginCreds)
    if(!result.success){
        return res.status(400).json({error:result.error.issues.map(err=>err.message)})
    }
    const {email,password}=result.data
    try{
        const dbPassword=await prisma.user.findUnique({
            where:{
                email
            },
            select:{
                password:true,
                id:true,
                role:true
            }
        })
        if(!dbPassword){
            return res.status(401).json({error:"Email does not exist"})
        }
        const isCorrect=await bcrypt.compare(password,dbPassword.password)
        if(!isCorrect){
            return res.status(401).json({error:"Incorrect password"})
        }
        const token=getToken({id:dbPassword.id,role:dbPassword.role})
        res.cookie('token',token,{
            secure:true,
            httpOnly:true,
            sameSite:'none'
        })
        return res.status(200).json({message:"Login successful",role:dbPassword.role})
    }catch(err){
        console.log(err)
        return res.status(500).json({error:"Internal server error"})
    }
}
export async function logoutController(req:Request,res:Response){
    res.clearCookie('token',{
        secure:true,
        httpOnly:true,
        sameSite:'none'
    })
    return res.status(200).json({message:'Logout successful'})
}
export async function meController(req:Request,res:Response){
    const id=req.id
    const user=await prisma.user.findUnique({
        where:{id},
        select:{name:true,profileUrl:true,profilePublicId:true}
    })
    if(!user){
        return res.status(404).json({error:"User not found"})
    }
    return res.status(200).json({
        id,
        role:req.role,
        name:user.name,
        profileUrl:user.profileUrl,
        isDefault:user.profilePublicId?false:true
    })
}