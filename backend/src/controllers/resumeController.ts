import type {Request,Response} from 'express'
import {prisma} from '../lib/prisma'
import * as z from 'zod'

const ResumeSchema=z.object({
    title:z.string().trim().min(1,{
        error:"Title cannot be empty"
    }).max(30,{
        error:"Title cannot be more than 30 charcters"
    }),
    summary:z.string().trim().min(1,{
        error:"Summary cannot be empty"
    }),
    linkedin:z.url({error:"Linkedin must be valid url"}).optional(),
    skills:z.array(z.string()).default([]),
    visibility:z.boolean().default(true),
    achievements:z.array(z.object({
        name:z.string().trim().min(1,{
            error:"Name cannot be empty"
        }),
        description:z.string().trim().min(1,{
            error:"Description cannot be empty"
        })
    })).default([]),
    projects:z.array(z.object({
        name:z.string().trim().min(1,{
            error:"Name cannot be empty"
        }),
        description:z.string().trim().min(1,{
            error:"Description cannot be empty"
        }),
        sourceCode:z.url({error:"Source code must be valid url"}).optional(),
        deployedLink:z.url({error:"Deployed link must be valid url"}).optional()
    })).default([]),
    education:z.array(z.object({
        institution:z.string().trim().min(1,{
            error:"Institution cannot be empty"
        }),
        degree:z.string().trim().optional(),
        startDate:z.date().max(new Date(),{error:"Start date cannot be in the future"}),
        endDate:z.date().optional()
    }).refine(data=>data.startDate.getTime()<(data.endDate?data.endDate.getTime():new Date().getDate()),{error:"Cannot have start date after end date"})).default([]),
    experience:z.array(z.object({
        company:z.string().trim().min(1,{
            error:"Institution cannot be empty"
        }),
        role:z.string().trim().min(1,{
            error:"Role cannot be empty"
        }),
        startDate:z.date().max(new Date(),{error:"Start date cannot be in the future"}),
        endDate:z.date().optional()
    }).refine(data=>data.startDate.getTime()<(data.endDate?data.endDate.getTime():new Date().getTime()),{error:"Cannot have start date after end date"})).default([]),
})

export async function createResumeController(req:Request,res:Response){
    const resumeEntry=req.body
    const id=req.id
    if(!id){
        return res.status(400).json({error:"Missing id"})//this is just to stop the typescript error i am facing.
    }
    try{
        const hasResume=await prisma.resume.findUnique({
            where:{userId:id},
            select:{id:true}
        })
        if(hasResume){
            return res.status(400).json({error:"Resume already exists"})
        }
        const result=ResumeSchema.safeParse(resumeEntry)
        if(!result.success){
            return res.status(400).json({error:result.error.issues.map(err=>err.message)})
        } 
        const data=result.data
        await prisma.resume.create({
            data:{
                userId:id,
                title:data.title,
                summary:data.summary,
                skills:data.skills,
                linkedin:data.linkedin,
                visibility:data.visibility,
                experience:{
                    createMany:{
                        data:data.experience
                    }
                },
                education:{
                    createMany:{
                        data:data.education
                    }
                },
                projects:{
                    createMany:{
                        data:data.projects
                    }
                },
                achievements:{
                    createMany:{
                        data:data.achievements
                    }
                },
            }
        })
        return res.status(201).json({message:"Resume created successfully"})
    }catch(err){
        console.log(err)
        return res.status(500).json({error:"Internal server error"})
    }
}

export async function getResumeController(req:Request,res:Response){
    try{

        const id=req.id
        const role=req.role
        if(role==='recruiter'){
            const resumes=await prisma.resume.findMany({
                where:{visibility:true}
            })
            return res.status(200).json({
                message:resumes.length===0?'No resumes found':'Fetch successful',
                data:resumes
            })
        }else{
            const resume=await prisma.resume.findUnique({
                where:{userId:id},
                include:{
                    achievements:true,
                    projects:true,
                    experience:true,
                    education:true
                }
            })
            if(!resume){
                return res.status(404).json({error:"Resume not found, please create a resume first"})
            }
            return res.status(200).json({
                message:"Resume found",
                data:resume
            })
        }
    }catch(err){
        console.log(err)
        return res.status(500).json({error:"Internal server error"})
    }
}