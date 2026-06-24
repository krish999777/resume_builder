import './Signup.css'
import * as z from 'zod'
import {useForm} from 'react-hook-form'
import type { SubmitHandler } from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {postSignup} from '../utils/api'
import {useMutation,useQueryClient} from '@tanstack/react-query'
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
    const queryClient=useQueryClient()
    const mutation=useMutation({
        mutationFn:postSignup,
        onSuccess: async (data) => {
            await queryClient.resetQueries({queryKey:['me']})
            data.role==='recruiter'?navigate('/'):navigate('/resume')
        }
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

    return (
        <div className="signup-wrap">
            <div className="signup-left">
                <div className="signup-left-content">
                    <p className="signup-left-eyebrow">Already have an account?</p>
                    <h2 className="signup-left-heading">Welcome back to ResumeHub</h2>
                    <p className="signup-left-body">Sign in to access your resume, track applications, and connect with recruiters.</p>
                    <button className="signup-login-btn" onClick={() => navigate('/login')}>Sign in</button>
                    <ul className="signup-features">
                        <li>Manage and update your resume anytime</li>
                        <li>Get discovered by top recruiters</li>
                        <li>Track your profile visibility</li>
                    </ul>
                </div>
            </div>
            <div className="signup-right">
                <div className="signup-brand">
                    <div className="signup-brand-icon">📄</div>
                    <span className="signup-brand-name">ResumeHub</span>
                </div>
                <div className="signup-center">
                    <h1 className="signup-heading">Create an account</h1>
                    <p className="signup-subtext">Join thousands of candidates and recruiters on ResumeHub</p>
                    {mutation.isError && <div className="signup-server-error">{mutation.error.message}</div>}
                    <form onSubmit={handleSubmit(onSubmit)} className="signup-form">
                        <div className="signup-role-toggle">
                            <input type="radio" id="candidate" className="hidden-radio" {...register('role')} value="candidate"/>
                            <input type="radio" id="recruiter" className="hidden-radio" {...register('role')} value="recruiter"/>
                            <label htmlFor="candidate" className={`roleBtn ${role === 'candidate' ? 'roleBtn-selected' : ''}`}>Candidate</label>
                            <label htmlFor="recruiter" className={`roleBtn ${role === 'recruiter' ? 'roleBtn-selected' : ''}`}>Recruiter</label>
                        </div>
                        {errors.role && <p className="signup-field-error">{errors.role.message}</p>}
                        <div className="signup-field">
                            <label className="signup-label">Full Name</label>
                            <input {...register('name')} placeholder="John Doe" className={`signup-input ${errors.name ? 'signup-input-error' : ''}`}/>
                            {errors.name && <p className="signup-field-error">{errors.name.message}</p>}
                        </div>
                        <div className="signup-field">
                            <label className="signup-label">Email</label>
                            <input {...register('email')} type="email" placeholder="you@example.com" className={`signup-input ${errors.email ? 'signup-input-error' : ''}`}/>
                            {errors.email && <p className="signup-field-error">{errors.email.message}</p>}
                        </div>
                        <div className="signup-field">
                            <label className="signup-label">Password</label>
                            <input {...register('password')} type="password" placeholder="••••••••" className={`signup-input ${errors.password ? 'signup-input-error' : ''}`}/>
                            {errors.password && <p className="signup-field-error">{errors.password.message}</p>}
                        </div>
                        <button className="signup-btn" disabled={mutation.isPending}>
                            {mutation.isPending ? (<><span className="signup-spinner"></span>Signing up</>) : 'Sign up'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}