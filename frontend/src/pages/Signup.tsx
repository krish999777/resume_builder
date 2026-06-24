import './Signup.css'
import * as z from 'zod'
import {useForm} from 'react-hook-form'
import type { SubmitHandler } from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {postSignup} from '../utils/api'
import {useMutation} from '@tanstack/react-query'
import {useNavigate} from 'react-router-dom'

const SignupSchema=z.object({
    role:z.enum(['candidate','recruiter']),
    name:z.string().trim().min(1,{
        error:"Name cannot be empty"
    }),
    email:z.email("Invalid email"),
    password:z.string().min(7,{
        error:"Password must be atleast 7 characters"
    })
})

type SignupType=z.infer<typeof SignupSchema>

export default function Signup(){

    const navigate=useNavigate()

    const mutation=useMutation({
        mutationFn:postSignup,
        onSuccess:()=>navigate('/home')
    })

    const {watch,register,handleSubmit,formState:{errors}}=useForm<SignupType>({
        resolver:zodResolver(SignupSchema),
        defaultValues:{
            role:'candidate'
        }
    })

    const role=watch('role')

    const onSubmit:SubmitHandler<SignupType>=(data)=>{
        mutation.mutate(data)
    }

    return(
        <form onSubmit={handleSubmit(onSubmit)}>
            {mutation.isError?<div>{mutation.error.message}</div>:null}
            <input type="radio" id="candidate" className="hidden-radio" {...register('role')} value="candidate"/>
            <input type="radio" id="recruiter" className="hidden-radio" {...register('role')} value="recruiter" />
            <label htmlFor='candidate' className={`roleBtn ${role==='candidate'?'roleBtn-selected':''}`}>Candidate</label>
            <label htmlFor='recruiter' className={`roleBtn ${role==='recruiter'?'roleBtn-selected':''}`}>Recruiter</label>
            <p>{errors.role?errors.role.message:null}</p>
            <input {...register('name')}/>
            <p>{errors.name?errors.name.message:null}</p>
            <input {...register('email')}/>
            <p>{errors.email?errors.email.message:null}</p>
            <input type="password"{...register('password')}/>
            <p>{errors.password?errors.password.message:null}</p>
            <button disabled={mutation.isPending}>{mutation.isPending?'Signing up':'Sign up'}</button>
        </form>
    )
}