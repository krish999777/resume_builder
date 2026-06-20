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

type EducationType=z.infer<typeof EducationSchema>
type ExperienceType=z.infer<typeof ExperienceSchema>
type ProjectType=z.infer<typeof ProjectSchema>
type AchievementType=z.infer<typeof AchievementSchema>

export async function putResumeController(req:Request,res:Response){
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

        const achievementSet:Set<number>=new Set()
        const projectSet:Set<number>=new Set()
        const experienceSet:Set<number>=new Set()
        const educationSet:Set<number>=new Set()

        userResume.achievements.forEach(achievement=>achievementSet.add(achievement.id))
        userResume.projects.forEach(project=>projectSet.add(project.id))
        userResume.education.forEach(ed=>educationSet.add(ed.id))
        userResume.experience.forEach(ex=>experienceSet.add(ex.id))

        let createExperience:ExperienceType[]=[]
        let editExperience:(ExperienceType&{id:number})[]=[]
        let deleteExperience:number[]=[]

        for(let ex of resume.experience){
            const exId=ex.id
            if(!exId){
                createExperience.push(ex)
            }else{
                if(experienceSet.has(exId)){
                    experienceSet.delete(exId)
                    editExperience.push({...ex,id:exId})
                }else{
                    return res.status(400).json({error:"Invalid id in experience"})
                }
            }
        }
        deleteExperience=[...experienceSet]


        let createProject:ProjectType[]=[]
        let editProject:(ProjectType&{id:number})[]=[]
        let deleteProject:number[]=[]

        for(let ex of resume.projects){
            const exId=ex.id
            if(!exId){
                createProject.push(ex)
            }else{
                if(projectSet.has(exId)){
                    projectSet.delete(exId)
                    editProject.push({...ex,id:exId})
                }else{
                    return res.status(400).json({error:"Invalid id in projects"})
                }
            }
        }
        deleteProject=[...projectSet]

        
        let createEducation:EducationType[]=[]
        let editEducation:(EducationType&{id:number})[]=[]
        let deleteEducation:number[]=[]

        for(let ex of resume.education){
            const exId=ex.id
            if(!exId){
                createEducation.push(ex)
            }else{
                if(educationSet.has(exId)){
                    educationSet.delete(exId)
                    editEducation.push({...ex,id:exId})
                }else{
                    return res.status(400).json({error:"Invalid id in education"})
                }
            }
        }
        deleteEducation=[...educationSet]

        let createAchievement:AchievementType[]=[]
        let editAchievement:(AchievementType&{id:number})[]=[]
        let deleteAchievement:number[]=[]

        for(let ex of resume.achievements){
            const exId=ex.id
            if(!exId){
                createAchievement.push(ex)
            }else{
                if(achievementSet.has(exId)){
                    achievementSet.delete(exId)
                    editAchievement.push({...ex,id:exId})
                }else{
                    return res.status(400).json({error:"Invalid id in achievements"})
                }
            }
        }
        deleteAchievement=[...achievementSet]


    }catch(err){
        console.log(err)
        return res.status(500).json({error:"Internal server error"})
    }

}