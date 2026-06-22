import type {Request,Response,NextFunction} from 'express'
import multer from 'multer'

export default function errorHandler(err:any,req:Request,res:Response,next:NextFunction){
    if(err instanceof multer.MulterError){
        return res.status(400).json({error:"Invalid file size"})
    }else if(err instanceof Error){
        return res.status(400).json({error:err.message})
    }else{
        next(err)
    }
}