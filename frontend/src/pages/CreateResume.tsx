import './CreateResume.css'
import {useFieldArray,useForm} from 'react-hook-form'
import type { SubmitHandler } from 'react-hook-form'
import * as z from 'zod'
import {zodResolver} from '@hookform/resolvers/zod'
import {useState} from 'react'

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

type InputType=z.infer<typeof ResumeSchema>

export default function CreateResume(){
    const [section,setSection]=useState<1|2|3|4|5>(1)
    const [skillCurrent,setSkillCurrent]=useState<string>('')

    const {control,register,handleSubmit,formState:{errors},setValue,watch}=useForm({
        resolver:zodResolver(ResumeSchema),
        defaultValues:{
            skills:[],
            visibility:"true"
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
    const onSubmit:SubmitHandler<InputType>=(data)=>console.log(data)
    const skills=watch('skills')
    const visibility=watch('visibility')

    return(
        <div>
            <button onClick={()=>setSection(1)}>Primary</button>
            <button onClick={()=>setSection(2)}>Education</button>
            <button onClick={()=>setSection(3)}>Experience</button>
            <button onClick={()=>setSection(4)}>Projects</button>
            <button onClick={()=>setSection(5)}>Achievements</button>
            <form onSubmit={handleSubmit(onSubmit)}>
                {section===1?
                <div>
                    Title:<input {...register('title')} required={true}/>
                    {errors.title?<p>{errors.title.message}</p>:null}
                    Summary:<input {...register('summary')} required={true}/>
                    {errors.summary?<p>{errors.summary.message}</p>:null}
                    Skills:<div>
                        {(skills||[]).map((skill,index)=>{
                            return(
                                <div key={index}>{skill}<button type="button" onClick={()=>{
                                    setValue('skills',(skills||[]).filter((_,i)=>i!==index))
                                }}>🗑️</button></div>
                            )
                        })}
                        <input type="text" value={skillCurrent} onChange={(e)=>setSkillCurrent(e.target.value)}/>
                        <button type="button" onClick={()=>{
                            if(skillCurrent===''){
                                return
                            }
                            setValue('skills',[...(skills||[]),skillCurrent])
                            setSkillCurrent('')
                        }}>+</button>
                    </div>
                    {errors.skills?<p>{errors.skills.message}</p>:null}
                    Linkedin(optional):<input type="url" {...register('linkedin',{
                        setValueAs:(value)=>value===""?undefined:value
                    })}/>
                    {errors.linkedin?<p>{errors.linkedin.message}</p>:null}
                    Visibility:
                    <input type="radio" style={{display:"none"}} id="visibility-true"value="true"{...register('visibility')}/>
                    <input type="radio" style={{display:"none"}} id="visibility-false"value="false"{...register('visibility')}/>
                    <label htmlFor="visibility-true" className={visibility==='true'?'visbility-selected':''}>Public</label>
                    <label htmlFor="visibility-false" className={visibility==='false'?'visbility-selected':''}>Private</label>
                    {errors.visibility?<p>{errors.visibility.message}</p>:null}
                </div>
                :
                null}
                {section===2?
                <div>
                    {educationField.fields.map((field,index)=>(
                        <div key={field.id}>
                            <input {...register(`education.${index}.institution`)}/>
                            <p>{errors.education?.[index]?.institution?.message||null}</p>
                            <input {...register(`education.${index}.degree`)}/>
                            <p>{errors.education?.[index]?.degree?.message||null}</p>
                            <input type="date" {...register(`education.${index}.startDate`)}/>
                            <p>{errors.education?.[index]?.startDate?.message}</p>
                            <input type="date" {...register(`education.${index}.endDate`,{
                                setValueAs:(val)=>val===''?undefined:val
                            })}/>
                            <p>{errors.education?.[index]?.endDate?.message}</p>
                            <button type="button" onClick={()=>educationField.remove(index)}>🗑️</button>
                            <p>{errors.education?.[index]?.message}</p>
                        </div>
                    ))}
                    <button type="button" onClick={()=>educationField.append({
                        institution:'',
                        degree:'',
                        startDate:'',
                        endDate:''
                    })}>+</button>
                </div>
                :
                null}
                {section===3?
                <div>
                    {experienceField.fields.map((field,index)=>(
                        <div key={field.id}>
                            <input {...register(`experience.${index}.company`)}/>
                            <p>{errors.experience?.[index]?.company?.message||null}</p>
                            <input {...register(`experience.${index}.role`)}/>
                            <p>{errors.experience?.[index]?.role?.message||null}</p>
                            <input type="date" {...register(`experience.${index}.startDate`)}/>
                            <p>{errors.experience?.[index]?.startDate?.message}</p>
                            <input type="date" {...register(`experience.${index}.endDate`,{
                                setValueAs:(val)=>val===''?undefined:val
                            })}/>
                            <p>{errors.experience?.[index]?.endDate?.message}</p>
                            <button type="button" onClick={()=>experienceField.remove(index)}>🗑️</button>
                            <p>{errors.experience?.[index]?.message}</p>
                        </div>
                    ))}
                    <button type="button" onClick={()=>experienceField.append({
                        company:'',
                        role:'',
                        startDate:'',
                        endDate:''
                    })}>+</button>
                </div>
                :
                null}
                {section===4?<div></div>:null}
                {section===5?<div></div>:null}
                <button>Save</button>
            </form>
        </div>
    )
}