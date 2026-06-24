import './Login.css'
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
        error:"Password must be at least 7 characters"
    })
})
type LoginType=z.infer<typeof LoginSchema>

export default function Login() {
    const navigate = useNavigate()
    const mutation = useMutation({
        mutationFn: postLogin,
        onSuccess: (data) => data.role==='recruiter'?navigate('/resumes'):navigate('/resume')
    })

    const { handleSubmit, register, formState: { errors } } = useForm<LoginType>({
        resolver: zodResolver(LoginSchema)
    })

    const onSubmit: SubmitHandler<LoginType> = (data) => {
        mutation.mutate(data)
    }

    return (
        <div className="login-wrap">
            <div className="login-left">
                <div className="login-brand">
                    <div className="login-brand-icon">📄</div>
                    <span className="login-brand-name">ResumeHub</span>
                </div>
                <div className="login-center">
                    <h1 className="login-heading">Welcome back</h1>
                    <p className="login-subtext">Sign in to manage your resume and opportunities</p>
                    {mutation.isError && (
                        <div className="login-server-error">{mutation.error.message}</div>
                    )}
                    <form onSubmit={handleSubmit(onSubmit)} className="login-form">
                        <div className="login-field">
                            <label className="login-label">Email</label>
                            <input {...register('email')} type="email" placeholder="you@example.com" className={`login-input ${errors.email ? 'login-input-error' : ''}`}/>
                            {errors.email && <p className="login-field-error">{errors.email.message}</p>}
                        </div>
                        <div className="login-field">
                            <label className="login-label">Password</label>
                            <input {...register('password')} type="password" placeholder="••••••••" className={`login-input ${errors.password ? 'login-input-error' : ''}`}/>
                            {errors.password && <p className="login-field-error">{errors.password.message}</p>}
                        </div>
                        <button className="login-btn" disabled={mutation.isPending}>
                            {mutation.isPending ? (<><span className="login-spinner"></span>Signing in</>) : 'Sign in'}
                        </button>
                    </form>
                </div>
            </div>
            <div className="login-right">
                <div className="login-right-content">
                    <p className="login-right-eyebrow">New here?</p>
                    <h2 className="login-right-heading">Build a resume that gets you hired</h2>
                    <p className="login-right-body">Create your profile, showcase your skills, and get discovered by recruiters looking for talent like yours.</p>
                    <button className="login-signup-btn" onClick={() => navigate('/signup')}>Create an account</button>
                    <ul className="login-features">
                        <li>Free resume builder with PDF export</li>
                        <li>Get found by top recruiters</li>
                        <li>Real-time feedback on your profile</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
