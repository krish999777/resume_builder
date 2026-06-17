import type {Request,Response,NextFunction} from 'express'
import {verifyToken} from '../utils/jwt'

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
    next()
}