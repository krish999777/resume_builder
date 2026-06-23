import {useMutation} from '@tanstack/react-query'
import {useForm} from 'react-hook-form'
import type {SubmitHandler} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {useNavigate} from 'react-router-dom'
import {postLogin} from '../utils/api'
import * as z from 'zod'

const LoginSchema=z.object({
    email:z.email({
        error:"Email must be valid"
    }),
    password:z.string().min(7,{
        error:"Password must be atleast 7 characters"
    })
})

type LoginType=z.infer<typeof LoginSchema>


export default function Login(){
    const navigate=useNavigate()
    const mutation=useMutation({
        mutationFn:(body:{email:string,password:string})=>postLogin(body),
        onSuccess:()=>navigate('/home')
    })

    const {handleSubmit,register,formState:{errors}}=useForm<LoginType>({
        resolver:zodResolver(LoginSchema)
    })
    const onSubmit:SubmitHandler<LoginType>=(data)=>{
        mutation.mutate(data)
    }

    return(
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <input {...register('email')}/>
                <p>{errors.email?errors.email.message:null}</p>
                <input type="password"{...register('password')}/>
                <p>{errors.password?errors.password.message:null}</p>
                {mutation.isError?mutation.error.message:null}
                <button disabled={mutation.isPending}>{mutation.isPending?'Loging in':'Log in'}</button>
            </form>
        </div>
    )
}