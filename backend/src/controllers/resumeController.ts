import type {Request,Response} from 'express'
import {prisma} from '../lib/prisma'
import * as z from 'zod'

const AchievementSchema=z.object({
    name:z.string().trim().min(1,{
        error:"Name cannot be empty"
    }),
    description:z.string().trim().min(1,{
        error:"Description cannot be empty"
    })
})

const ProjectSchema=z.object({
    name:z.string().trim().min(1,{
        error:"Name cannot be empty"
    }),
    description:z.string().trim().min(1,{
        error:"Description cannot be empty"
    }),
    sourceCode:z.url({error:"Source code must be valid url"}).optional(),
    deployedLink:z.url({error:"Deployed link must be valid url"}).optional()
})

const EducationSchema=z.object({
    institution:z.string().trim().min(1,{
        error:"Institution cannot be empty"
    }),
    degree:z.string().trim().optional(),
    startDate:z.date().max(new Date(),{error:"Start date cannot be in the future"}),
    endDate:z.date().optional()
}).refine(data=>data.startDate.getTime()<(data.endDate?data.endDate.getTime():new Date().getTime()),{error:"Cannot have start date after end date"})

const ExperienceSchema=z.object({
        company:z.string().trim().min(1,{
            error:"Institution cannot be empty"
        }),
        role:z.string().trim().min(1,{
            error:"Role cannot be empty"
        }),
        startDate:z.date().max(new Date(),{error:"Start date cannot be in the future"}),
        endDate:z.date().optional()
    }).refine(data=>data.startDate.getTime()<(data.endDate?data.endDate.getTime():new Date().getTime()),{error:"Cannot have start date after end date"})

const ResumeSchema=z.object({
    title:z.string({error:"Title must be present"}).trim().min(1,{
        error:"Title cannot be empty"
    }).max(30,{
        error:"Title cannot be more than 30 charcters"
    }),
    summary:z.string({error:"Summary must be present"}).trim().min(1,{
        error:"Summary cannot be empty"
    }),
    linkedin:z.url({error:"Linkedin must be valid url"}).optional(),
    skills:z.array(z.string()).default([]),
    visibility:z.boolean().default(true),
    achievements:z.array(AchievementSchema).default([]),
    projects:z.array(ProjectSchema).default([]),
    education:z.array(EducationSchema).default([]),
    experience:z.array(ExperienceSchema).default([]),
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

export async function getEachResumeController(req:Request,res:Response){
    const {userId}=req.params
    const IdScehma=z.coerce.number()
    const result=IdScehma.safeParse(userId)
    if(!result.success){
        return res.status(400).json({error:"id must be number"})
    }
    try{
        const resume=await prisma.resume.findFirst({
            where:{
                userId:result.data,
                visibility:true
            },
            include:{
                achievements:true,
                projects:true,
                experience:true,
                education:true
            }
        })
        if(!resume){
            return res.status(404).json({error:"No resume found for user with this id"})
        }
        return res.status(200).json({message:"Resume found",data:resume})
    }catch(err){
        return res.status(500).json({error:"Internal server error"})
    }
}
const EditResumeSchema=ResumeSchema.safeExtend({
    achievements:z.array(AchievementSchema.safeExtend({
        id:z.int().min(1).optional()
    })).default([]),
    projects:z.array(ProjectSchema.safeExtend({
        id:z.int().min(1).optional()
    })).default([]),
    education:z.array(EducationSchema.safeExtend({
        id:z.int().min(1).optional()
    })).default([]),
    experience:z.array(ExperienceSchema.safeExtend({
        id:z.int().min(1).optional()
    })).default([])
})

// type EducationType=z.infer<typeof EducationSchema>
// type ExperienceType=z.infer<typeof ExperienceSchema>
// type ProjectType=z.infer<typeof ProjectSchema>
// type AchievementType=z.infer<typeof AchievementSchema>

export async function putResumeController(req:Request,res:Response){//the logic on this controller was too complex and in the process of refactoring the code and making it more DRY, I messed up the typescript so there is any type everywhere.
    const id=req.id
    const editResume=req.body
    const result=EditResumeSchema.safeParse(editResume)
    if(!result.success){
        return res.status(400).json({error:result.error.issues.map(err=>err.message)})
    }
    const resume=result.data
    try{
        const userResume=await prisma.resume.findUnique({
            where:{userId:id},
            select:{
                id:true,
                achievements:{
                    select:{id:true}
                },
                projects:{
                    select:{id:true}
                },
                education:{
                    select:{id:true}
                },
                experience:{
                    select:{id:true}
                },
            }
        })
        if(!userResume){
            return res.status(404).json({error:"Resume not found"})
        }
        const resumeId=userResume.id

        function populateArrays(fieldArray:any[],idArray:any[]){
            const set:Set<number>=new Set()
            idArray.forEach(el=>set.add(el.id))
            let allArray:{create:any[],edit:any[],delete:number[]}={
                create:[],
                edit:[],
                delete:[]
            }
            for(let ex of fieldArray){
                const exId:number=ex.id
                if(!exId){
                    allArray.create.push(ex)
                }else{
                    if(set.has(exId)){
                        set.delete(exId)
                        allArray.edit.push({...ex,id:exId})
                    }else{
                        return "Invalid"
                    }
                }
            }
            allArray.delete=[...set]
            return allArray
        }

        const exResult=populateArrays(resume.experience,userResume.experience)
        const prResult=populateArrays(resume.projects,userResume.projects)
        const edResult=populateArrays(resume.education,userResume.education)
        const acResult=populateArrays(resume.achievements,userResume.achievements)
        if(exResult==="Invalid"||prResult==="Invalid"||edResult==="Invalid"||acResult==="Invalid"){
            return res.status(400).json({error:`Invalid id in relational fields`})
        }
        const updatedResume=await prisma.resume.update({
            where:{id:resumeId},
            data:{
                title:resume.title,
                summary:resume.summary,
                linkedin:resume.linkedin?resume.linkedin:null,
                skills:resume.skills,
                visibility:resume.visibility,
                achievements:{
                    createMany:{data:acResult.create},
                    deleteMany:{
                        id:{in:acResult.delete}
                    },
                    update:acResult.edit.map(field=>{
                        const {id,...updatedField}=field
                        return({
                            where:{id},
                            data:updatedField
                        })
                    })
                },
                projects:{
                    createMany:{data:prResult.create},
                    deleteMany:{
                        id:{in:prResult.delete}
                    },
                    update:prResult.edit.map(field=>{
                        const {id,...updatedField}=field
                        return({
                            where:{id},
                            data:updatedField
                        })
                    })
                },
                experience:{
                    createMany:{data:exResult.create},
                    deleteMany:{
                        id:{in:exResult.delete}
                    },
                    update:exResult.edit.map(field=>{
                        const {id,...updatedField}=field
                        return({
                            where:{id},
                            data:updatedField
                        })
                    })
                },
                education:{
                    createMany:{data:edResult.create},
                    deleteMany:{
                        id:{in:edResult.delete}
                    },
                    update:edResult.edit.map(field=>{
                        const {id,...updatedField}=field
                        return({
                            where:{id},
                            data:updatedField
                        })
                    })
                }
            },
            include:{
                achievements:true,
                projects:true,
                education:true,
                experience:true
            }
        })
        return res.status(200).json({message:"Resume edited successfully", data:updatedResume})
    }catch(err){
        console.log(err)
        return res.status(500).json({error:"Internal server error"})
    }

}

export async function deleteResume(req:Request,res:Response){
    const id=req.id
    try{
        const isResume=await prisma.resume.findUnique({
            where:{userId:id},
            select:{id:true}
        })
        if(!isResume){
            return res.status(404).json({error:"Resume not found"})
        }
        await prisma.resume.delete({
            where:{id:isResume.id}
        })
        return res.status(204).send()
    }catch(err){
        console.log(err)
        return res.status(500).json({error:"Internal server error"})
    }
}