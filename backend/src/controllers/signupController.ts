import type {Request,Response} from 'express'
import * as z from 'zod'
import {prisma} from '../lib/prisma'
import {getToken} from '../utils/jwt'
import bcrypt from 'bcrypt'

const SignupSchema=z.object({
    role:z.enum(['candidate','recruiter']),
    name:z.string().trim().min(1,{
        error:"Name cannot be empty"
    }),
    email:z.email("Invalid email"),
    password:z.string().min(7,{
        error:"Password must be atleast 7 characters"
    })
})
export async function signupController(req:Request,res:Response){
    const creds=req.body
    const signupCreds=SignupSchema.safeParse(creds)
    if(!signupCreds.success){
        return res.status(400).json({error:signupCreds.error.issues.map(err=>err.message)})
    }
    const {name,email,password,role}=signupCreds.data
    try{
        const isEmail=await prisma.user.findUnique({
            where:{
                email
            }
        })
        if(isEmail){
            return res.status(400).json({error:"Email already exists"})
        }
        const hashedPassword=await bcrypt.hash(password,10)
    
        const response=await prisma.user.create({
            data:{
                role,email,name,password:hashedPassword
            }
        })
        const token=getToken({id:response.id,role:response.role})
        res.cookie("token",token,{
            httpOnly:true,
            secure:true,
            sameSite:'none'
        })
    
        res.status(201).json({message:"Signup successful",role:response.role})
    }catch(err){
        return res.status(500).json({error:"Internal server error"})
    }
}