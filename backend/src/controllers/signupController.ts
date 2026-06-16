import type {Request,Response} from 'express'
import * as z from 'zod'
import {prisma} from '../lib/prisma'
import {getToken} from '../utils/jwt'

export async function signupController(req:Request,res:Response){
    const creds=req.body
    const SignupSchema=z.object({
        role:z.literal('candidate','recruiter'),
        name:z.string().trim().min(1,{
            error:"Name cannot be empty"
        }),
        email:z.email("Invalid email"),
        password:z.string().min(7,{
            error:"Password must be atleast 7 characters"
        })
    })
    const signupCreds=SignupSchema.safeParse(creds)
    if(!signupCreds.success){
        return res.status(400).json({error:signupCreds.error.message})
    }
    
}