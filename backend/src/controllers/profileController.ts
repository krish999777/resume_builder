import type {Request,Response} from 'express'
import {prisma} from '../lib/prisma'
import {v2 as cloudinary} from 'cloudinary'
 
export async function putProfileController(req:Request,res:Response){
    const id=req.id
    if(!req.file){
        return res.status(400).json({error:"File not uploaded"})
    }
    try{
        const user=await prisma.user.findUnique({
            where:{id},
            select:{
                profilePublicId:true
            }
        })
        if(!user){
            return res.status(404).json({error:"User not found"})//just to stop ts error
        }
        const uploadResult:any=await new Promise((resolve,reject)=>{
            cloudinary.uploader.upload_stream((error,result)=>{
                if(error){
                    return reject(new Error('Upload failed'))
                }
                return resolve(result)
            }).end(req.file?.buffer)
        })
        if(user.profilePublicId){
            try{
                const destroy:any=await cloudinary.uploader.destroy(user.profilePublicId)
                if(!(destroy.result==='ok')&&!(destroy.result==='not found')){
                    throw new Error('Failed')
                }
            }catch(err){
                console.log(err)
                return res.status(500).json({error:"Unknown error deleting profile picture"})
            }
        }
        const saveResult=await prisma.user.update({
            where:{id},
            data:{
                profilePublicId:uploadResult.public_id,
                profileUrl:uploadResult.secure_url
            },
            select:{
                profileUrl:true
            }
        })
        return res.status(200).json({
            profileUrl:saveResult.profileUrl
        })
    }catch(err){
        console.log(err)
        return res.status(500).json({error:"Internal server error"})
    }
}