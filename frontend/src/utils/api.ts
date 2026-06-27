import axios from 'axios'
import type {PostResumeType,PutResumeType} from '../components/ResumeForm'

const api=axios.create({
    baseURL:import.meta.env.VITE_BACKEND_URL||'http://localhost:8000',
    withCredentials:true
})

export async function postLogin(body:{email:string,password:string}){
    try{
        const res=await api.post('/auth/login',body)
        return res.data as {message:string,role:'recruiter'|'candidate'}
    }catch(err:any){
        throw new Error(err.response?.data?.error||'Unkown error')
    }
}

export async function postSignup(body:{role:'candidate'|'recruiter',name:string,email:string,password:string}){
    try{
        const res=await api.post('/auth/signup',body)
        return res.data as {message:string,role:'recruiter'|'candidate'}
    }catch(err:any){
        throw new Error(err.response?.data?.error||'Unknown error')
    }
}

export async function getMe(){
    try{
        const res=await api.get('/auth/me')
        return res.data as {
            id:number,
            role:'recruiter'|'candidate',
            name:string,
            profileUrl:string,
            isDefault:boolean
        } 
    }catch(err:any){
        throw new Error(err.response?.data?.error||'Unknown error')
    }
}

export type getResumeType={
    id: number;
    title: string;
    summary: string;
    linkedin: string | null;
    skills: string[];
    visibility: boolean;
    userId: number;
    user: {
        id: number;
        name: string;
        role: 'candidate'|'recruiter';
        email: string;
        password: string;
        profilePublicId: string | null;
        profileUrl: string;
    },
    achievements: {
        name: string;
        id: number;
        description: string;
        resumeId: number;
    }[],
    projects: {
        name: string;
        id: number;
        description: string;
        sourceCode: string | null;
        deployedLink: string | null;
        resumeId: number;
    }[],
    education: {
        id: number;
        institution: string;
        degree: string | null;
        startDate: Date;
        endDate: Date | null;
        resumeId: number;
    }[],
    experience: {
        role: string;
        id: number;
        startDate: Date;
        endDate: Date | null;
        company: string;
        resumeId: number;
    }[]
}

export async function getResume(){
    try{
        const res=await api.get('/resume')
        return res.data as {
            message:string,
            data:getResumeType|null
        }
    }catch(err:any){
        throw new Error(err.response?.data?.error||'Unknown error')
    }
}
export async function postResume(body:PostResumeType){
    try{
        const res=await api.post('/resume',body)
        return res.data as {message:string}
    }catch(err:any){
        throw new Error(err.response?.data?.error||'Unknown error')
    }
}
export async function postLogout(){
    try{

        const res=await api.post('/auth/logout')
        return res.data
    }catch(err:any){
        throw new Error(err.response?.data?.error||'Unknown error')
    }
}

export async function putResume(body:PutResumeType){
    try{
        const res=await api.put('/resume',body)
        return res.data
    }catch(err:any){
        throw new Error(err.response?.data?.error||'Unknown error')
    }
}

export async function deleteResume(){
    try{
        await api.delete('/resume')
    }catch(err:any){
        throw new Error(err.response?.data?.error||'Unknown error')
    }
}

export async function putProfile(body:FormData){
    try{
        const res=await api.put('/profile',body)
        return res.data
    }catch(err:any){
        throw new Error(err.response?.data?.error||'Unknown error')
    }
}

export async function deleteProfile(){
    try{
        await api.delete('/profile')
    }catch(err:any){
        throw new Error(err.response?.data?.error||'Unknown error')
    }
}