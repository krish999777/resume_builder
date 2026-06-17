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
        return res.status(200).json({message:"Login successful"})
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