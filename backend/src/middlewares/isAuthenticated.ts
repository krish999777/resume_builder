import type {Request,Response,NextFunction} from 'express'
import {verifyToken} from '../utils/jwt'
import * as z from 'zod'

const JwtSchema=z.object({
    id:z.coerce.number(),
    role:z.enum(['candidate','recruiter'])
})

export async function isAuthenticated(req:Request,res:Response,next:NextFunction){
    const {token}=req.cookies
    if(!token){
        res.clearCookie('token')
        return res.status(401).json({error:"Not authorized. Please log in again"})
    }
    const payload=verifyToken(token)
    if(!payload){
        res.clearCookie('token')
        return res.status(401).json({error:"Token expired. Please log in again"})
    }
    const result=JwtSchema.safeParse(payload)
    if(!result.success){
        res.clearCookie('token')
        return res.status(401).json({error:"Invalid token. Please log in again"})
    }
    req.id=result.data.id
    req.role=result.data.role
    next()
}