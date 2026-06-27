import './ResumeForm.css'
import * as z from 'zod'
import {useState} from 'react'
import {useFieldArray,useForm} from 'react-hook-form'
import type { SubmitHandler } from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {postResume,putResume} from '../utils/api'
import {useMutation,useQueryClient} from '@tanstack/react-query'
import {useNavigate} from 'react-router-dom'
import toast from 'react-hot-toast'
import type {getResumeType} from '../utils/api'

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
    startDate:z.coerce.date().max(new Date(),{error:"Start date cannot be in the future"}),
    endDate:z.coerce.date().optional()
}).refine(data=>data.startDate.getTime()<(data.endDate?data.endDate.getTime():new Date().getTime()),{error:"Cannot have start date after end date"})

const ExperienceSchema=z.object({
        company:z.string().trim().min(1,{
            error:"Institution cannot be empty"
        }),
        role:z.string().trim().min(1,{
            error:"Role cannot be empty"
        }),
        startDate:z.coerce.date().max(new Date(),{error:"Start date cannot be in the future"}),
        endDate:z.coerce.date().optional()
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
        visibility:z.preprocess(val=>{
        if(typeof val==='string'){
            return val.toLowerCase()==='true'
        }
        return val
    },z.boolean().default(true)),
    achievements:z.array(AchievementSchema).default([]),
    projects:z.array(ProjectSchema).default([]),
    education:z.array(EducationSchema).default([]),
    experience:z.array(ExperienceSchema).default([]),
})

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

export type PostResumeType=z.infer<typeof ResumeSchema>
export type PutResumeType=z.infer<typeof EditResumeSchema>


export default function ResumeForm({existingData,mode}:{
    existingData?:getResumeType,
    mode:'create'|'edit'
}){
    const [section,setSection]=useState<1|2|3|4|5>(1)
    const [skillCurrent,setSkillCurrent]=useState<string>('')

    const navigate=useNavigate()
    const queryClient=useQueryClient()

    const mutation=useMutation({
        mutationFn:mode==='create'?postResume:putResume,
        onSuccess:(data)=>{
            queryClient.invalidateQueries({queryKey:['resume']})
            toast.success(data.message)
            navigate('/resume')
        },
        onError:(err)=>toast.error(err.message)
    })

    

    const {control,register,handleSubmit,formState:{errors},setValue,watch}=useForm({
        resolver:zodResolver(mode==='create'?ResumeSchema:EditResumeSchema),
        defaultValues:mode==='create'?{
            skills:[],
            visibility:"true"
        }:{
            title:existingData!.title,
            summary:existingData!.summary,
            skills:existingData!.skills,
            linkedin:existingData!.linkedin||undefined,
            visibility:existingData!.visibility?'true':'false',
            education: existingData!.education.map(e => ({
                id: e.id,
                institution: e.institution,
                degree: e.degree ?? undefined,
                startDate: new Date(e.startDate).toISOString().split('T')[0],
                endDate:e.endDate ? new Date(e.endDate).toISOString().split('T')[0] : undefined
            })),
            experience: existingData!.experience.map(e => ({
                id: e.id,
                company: e.company,
                role: e.role,
                startDate: new Date(e.startDate).toISOString().split('T')[0],
                endDate: e.endDate ? new Date(e.endDate).toISOString().split('T')[0] : undefined
            })),
            projects: existingData!.projects.map(p => ({
                id: p.id,
                name: p.name,
                description: p.description,
                sourceCode: p.sourceCode ?? undefined,
                deployedLink: p.deployedLink ?? undefined
            })),
            achievements: existingData!.achievements.map(a => ({
                id: a.id,
                name: a.name,
                description: a.description
            }))
        }
    })
    const educationField=useFieldArray({
        control,
        name:'education'
    })
    const experienceField=useFieldArray({
        control,
        name:'experience'
    })
    const projectField=useFieldArray({
        control,
        name:'projects'
    })
    const achievementField=useFieldArray({
        control,
        name:'achievements'
    })
    const onSubmit:SubmitHandler<PostResumeType|PutResumeType>=(data)=>{
        mutation.mutate(data)
    }
    const skills=watch('skills')
    const visibility=watch('visibility')

    const isErrorPrimary=errors.linkedin||errors.title||errors.summary||errors.visibility||errors.skills
    const isErrorEducation=errors.education
    const isErrorExperience=errors.experience
    const isErrorProjects=errors.projects
    const isErrorAchievements=errors.achievements

    return(
        <div className="cr-wrap">
            <aside className="cr-sidebar">
                <h2 className="cr-sidebar-title">Create Resume</h2>
                <nav className="cr-nav">
                    <button type="button" className={`cr-nav-btn ${section===1?'cr-nav-btn-active':''} ${isErrorPrimary ?'cr-nav-has-error':''}`} onClick={()=>setSection(1)}>Primary</button>
                    <button type="button" className={`cr-nav-btn ${section===2?'cr-nav-btn-active':''} ${isErrorEducation ?'cr-nav-has-error':''}`} onClick={()=>setSection(2)}>Education</button>
                    <button type="button" className={`cr-nav-btn ${section===3?'cr-nav-btn-active':''} ${isErrorExperience ?'cr-nav-has-error':''}`} onClick={()=>setSection(3)}>Experience</button>
                    <button type="button" className={`cr-nav-btn ${section===4?'cr-nav-btn-active':''} ${isErrorProjects ?'cr-nav-has-error':''}`} onClick={()=>setSection(4)}>Projects</button>
                    <button type="button" className={`cr-nav-btn ${section===5?'cr-nav-btn-active':''} ${isErrorAchievements ?'cr-nav-has-error':''}`} onClick={()=>setSection(5)}>Achievements</button>
                </nav>
            </aside>
            <main className="cr-main">
                <form onSubmit={handleSubmit(onSubmit)} className="cr-form">
                    {section===1?
                    <div className="cr-section">
                        <h3 className="cr-section-title">Primary Info</h3>
                        <div className="cr-field">
                            <label className="cr-label">Title</label>
                            <input {...register('title')} className={`cr-input ${errors.title?'cr-input-error':''}`} placeholder="e.g. Full Stack Developer"/>
                            {errors.title&&<p className="cr-error">{errors.title.message}</p>}
                        </div>
                        <div className="cr-field">
                            <label className="cr-label">Summary</label>
                            <textarea {...register('summary')} className={`cr-textarea ${errors.summary?'cr-input-error':''}`} placeholder="Brief professional summary..."/>
                            {errors.summary&&<p className="cr-error">{errors.summary.message}</p>}
                        </div>
                        <div className="cr-field">
                            <label className="cr-label">Skills</label>
                            <div className="cr-skills-tags">
                                {(skills||[]).map((skill,index)=>(
                                    <span key={index} className="cr-skill-tag">
                                        {skill}
                                        <button type="button" className="cr-skill-remove" onClick={()=>setValue('skills',(skills||[]).filter((_,i)=>i!==index))}>×</button>
                                    </span>
                                ))}
                            </div>
                            <div className="cr-skills-input-row">
                                <input type="text" className="cr-input" value={skillCurrent} onChange={(e)=>setSkillCurrent(e.target.value)} placeholder="Add a skill..." onKeyDown={(e)=>{
                                    if(e.key==='Enter'){
                                        e.preventDefault()
                                        if(skillCurrent==='') return
                                        setValue('skills',[...(skills||[]),skillCurrent])
                                        setSkillCurrent('')
                                    }
                                }}/>
                                <button type="button" className="cr-add-btn" onClick={()=>{
                                    if(skillCurrent==='') return
                                    setValue('skills',[...(skills||[]),skillCurrent])
                                    setSkillCurrent('')
                                }}>Add</button>
                            </div>
                            {errors.skills&&<p className="cr-error">{errors.skills.message}</p>}
                        </div>
                        <div className="cr-field">
                            <label className="cr-label">LinkedIn <span className="cr-optional">(optional)</span></label>
                            <input type="url" {...register('linkedin',{setValueAs:(value)=>value===""?undefined:value})} className={`cr-input ${errors.linkedin?'cr-input-error':''}`} placeholder="https://linkedin.com/in/..."/>
                            {errors.linkedin&&<p className="cr-error">{errors.linkedin.message}</p>}
                        </div>
                        <div className="cr-field">
                            <label className="cr-label">Visibility</label>
                            <div className="cr-visibility-toggle">
                                <input type="radio" style={{display:"none"}} id="visibility-true" value="true" {...register('visibility')}/>
                                <input type="radio" style={{display:"none"}} id="visibility-false" value="false" {...register('visibility')}/>
                                <label htmlFor="visibility-true" className={`cr-visibility-btn ${visibility==='true'?'cr-visibility-selected':''}`}>Public</label>
                                <label htmlFor="visibility-false" className={`cr-visibility-btn ${visibility==='false'?'cr-visibility-selected':''}`}>Private</label>
                            </div>
                            {errors.visibility&&<p className="cr-error">{errors.visibility.message}</p>}
                        </div>
                    </div>
                    :null}
                    {section===2?
                    <div className="cr-section">
                        <h3 className="cr-section-title">Education</h3>
                        {educationField.fields.map((field,index)=>(
                            <div key={field.id} className="cr-card">
                                <div className="cr-card-header">
                                    <span className="cr-card-index">#{index+1}</span>
                                    <button type="button" className="cr-remove-btn" onClick={()=>educationField.remove(index)}>Remove</button>
                                </div>
                                <div className="cr-field">
                                    <label className="cr-label">Institution</label>
                                    <input {...register(`education.${index}.institution`)} className={`cr-input ${errors.education?.[index]?.institution?'cr-input-error':''}`} placeholder="University name"/>
                                    {errors.education?.[index]?.institution&&<p className="cr-error">{errors.education?.[index]?.institution?.message}</p>}
                                </div>
                                <div className="cr-field">
                                    <label className="cr-label">Degree <span className="cr-optional">(optional)</span></label>
                                    <input {...register(`education.${index}.degree`)} className="cr-input" placeholder="e.g. BSc Computer Science"/>
                                </div>
                                <div className="cr-date-row">
                                    <div className="cr-field">
                                        <label className="cr-label">Start Date</label>
                                        <input type="date" {...register(`education.${index}.startDate`)} className={`cr-input ${errors.education?.[index]?.startDate?'cr-input-error':''}`}/>
                                        {errors.education?.[index]?.startDate&&<p className="cr-error">{errors.education?.[index]?.startDate?.message}</p>}
                                    </div>
                                    <div className="cr-field">
                                        <label className="cr-label">End Date <span className="cr-optional">(optional)</span></label>
                                        <input type="date" {...register(`education.${index}.endDate`,{setValueAs:(val)=>val===''?undefined:val})} className={`cr-input ${errors.education?.[index]?.endDate?'cr-input-error':''}`}/>
                                        {errors.education?.[index]?.endDate&&<p className="cr-error">{errors.education?.[index]?.endDate?.message}</p>}
                                    </div>
                                </div>
                                {errors.education?.[index]?.message&&<p className="cr-error">{errors.education?.[index]?.message}</p>}
                            </div>
                        ))}
                        <button type="button" className="cr-append-btn" onClick={()=>educationField.append({institution:'',degree:'',startDate:'',endDate:''})}>+ Add Education</button>
                    </div>
                    :null}
                    {section===3?
                    <div className="cr-section">
                        <h3 className="cr-section-title">Experience</h3>
                        {experienceField.fields.map((field,index)=>(
                            <div key={field.id} className="cr-card">
                                <div className="cr-card-header">
                                    <span className="cr-card-index">#{index+1}</span>
                                    <button type="button" className="cr-remove-btn" onClick={()=>experienceField.remove(index)}>Remove</button>
                                </div>
                                <div className="cr-field">
                                    <label className="cr-label">Company</label>
                                    <input {...register(`experience.${index}.company`)} className={`cr-input ${errors.experience?.[index]?.company?'cr-input-error':''}`} placeholder="Company name"/>
                                    {errors.experience?.[index]?.company&&<p className="cr-error">{errors.experience?.[index]?.company?.message}</p>}
                                </div>
                                <div className="cr-field">
                                    <label className="cr-label">Role</label>
                                    <input {...register(`experience.${index}.role`)} className={`cr-input ${errors.experience?.[index]?.role?'cr-input-error':''}`} placeholder="e.g. Software Engineer"/>
                                    {errors.experience?.[index]?.role&&<p className="cr-error">{errors.experience?.[index]?.role?.message}</p>}
                                </div>
                                <div className="cr-date-row">
                                    <div className="cr-field">
                                        <label className="cr-label">Start Date</label>
                                        <input type="date" {...register(`experience.${index}.startDate`)} className={`cr-input ${errors.experience?.[index]?.startDate?'cr-input-error':''}`}/>
                                        {errors.experience?.[index]?.startDate&&<p className="cr-error">{errors.experience?.[index]?.startDate?.message}</p>}
                                    </div>
                                    <div className="cr-field">
                                        <label className="cr-label">End Date <span className="cr-optional">(optional)</span></label>
                                        <input type="date" {...register(`experience.${index}.endDate`,{setValueAs:(val)=>val===''?undefined:val})} className={`cr-input ${errors.experience?.[index]?.endDate?'cr-input-error':''}`}/>
                                        {errors.experience?.[index]?.endDate&&<p className="cr-error">{errors.experience?.[index]?.endDate?.message}</p>}
                                    </div>
                                </div>
                                {errors.experience?.[index]?.message&&<p className="cr-error">{errors.experience?.[index]?.message}</p>}
                            </div>
                        ))}
                        <button type="button" className="cr-append-btn" onClick={()=>experienceField.append({company:'',role:'',startDate:'',endDate:''})}>+ Add Experience</button>
                    </div>
                    :null}
                    {section===4?
                    <div className="cr-section">
                        <h3 className="cr-section-title">Projects</h3>
                        {projectField.fields.map((field,index)=>(
                            <div key={field.id} className="cr-card">
                                <div className="cr-card-header">
                                    <span className="cr-card-index">#{index+1}</span>
                                    <button type="button" className="cr-remove-btn" onClick={()=>projectField.remove(index)}>Remove</button>
                                </div>
                                <div className="cr-field">
                                    <label className="cr-label">Name</label>
                                    <input {...register(`projects.${index}.name`)} className={`cr-input ${errors.projects?.[index]?.name?'cr-input-error':''}`} placeholder="Project name"/>
                                    {errors.projects?.[index]?.name&&<p className="cr-error">{errors.projects?.[index]?.name?.message}</p>}
                                </div>
                                <div className="cr-field">
                                    <label className="cr-label">Description</label>
                                    <textarea {...register(`projects.${index}.description`)} className={`cr-textarea ${errors.projects?.[index]?.description?'cr-input-error':''}`} placeholder="What did you build?"/>
                                    {errors.projects?.[index]?.description&&<p className="cr-error">{errors.projects?.[index]?.description?.message}</p>}
                                </div>
                                <div className="cr-field">
                                    <label className="cr-label">Deployed Link <span className="cr-optional">(optional)</span></label>
                                    <input {...register(`projects.${index}.deployedLink`,{setValueAs:(val)=>val===''?undefined:val})} className={`cr-input ${errors.projects?.[index]?.deployedLink?'cr-input-error':''}`} placeholder="https://..."/>
                                    {errors.projects?.[index]?.deployedLink&&<p className="cr-error">{errors.projects?.[index]?.deployedLink?.message}</p>}
                                </div>
                                <div className="cr-field">
                                    <label className="cr-label">Source Code <span className="cr-optional">(optional)</span></label>
                                    <input {...register(`projects.${index}.sourceCode`,{setValueAs:(val)=>val===''?undefined:val})} className={`cr-input ${errors.projects?.[index]?.sourceCode?'cr-input-error':''}`} placeholder="https://github.com/..."/>
                                    {errors.projects?.[index]?.sourceCode&&<p className="cr-error">{errors.projects?.[index]?.sourceCode?.message}</p>}
                                </div>
                            </div>
                        ))}
                        <button type="button" className="cr-append-btn" onClick={()=>projectField.append({name:'',description:'',sourceCode:'',deployedLink:''})}>+ Add Project</button>
                    </div>
                    :null}
                    {section===5?
                    <div className="cr-section">
                        <h3 className="cr-section-title">Achievements</h3>
                        {achievementField.fields.map((field,index)=>(
                            <div key={field.id} className="cr-card">
                                <div className="cr-card-header">
                                    <span className="cr-card-index">#{index+1}</span>
                                    <button type="button" className="cr-remove-btn" onClick={()=>achievementField.remove(index)}>Remove</button>
                                </div>
                                <div className="cr-field">
                                    <label className="cr-label">Name</label>
                                    <input {...register(`achievements.${index}.name`)} className={`cr-input ${errors.achievements?.[index]?.name?'cr-input-error':''}`} placeholder="Achievement title"/>
                                    {errors.achievements?.[index]?.name&&<p className="cr-error">{errors.achievements?.[index]?.name?.message}</p>}
                                </div>
                                <div className="cr-field">
                                    <label className="cr-label">Description</label>
                                    <textarea {...register(`achievements.${index}.description`)} className={`cr-textarea ${errors.achievements?.[index]?.description?'cr-input-error':''}`} placeholder="Describe the achievement..."/>
                                    {errors.achievements?.[index]?.description&&<p className="cr-error">{errors.achievements?.[index]?.description?.message}</p>}
                                </div>
                            </div>
                        ))}
                        <button type="button" className="cr-append-btn" onClick={()=>achievementField.append({name:'',description:''})}>+ Add Achievement</button>
                    </div>
                    :null}
                    <div className="cr-footer">
                        {mode==='edit'&&<button type="button" className="cr-cancel-btn" disabled={mutation.isPending} onClick={()=>navigate('/resume')}>Cancel</button>}
                        <button className="cr-submit-btn" disabled={mutation.isPending}>
                            {mutation.isPending?<><span className="cr-spinner"/>Saving...</>:'Save Resume'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    )
}