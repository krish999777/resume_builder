import axios from 'axios'

const api=axios.create({
    baseURL:import.meta.env.VITE_BACKEND_URL||'http://localhost:8000',
    withCredentials:true
})

export async function postLogin(body:{email:string,password:string}){
    try{
        const res=await api.post('/auth/login',body)
        return res.data
    }catch(err:any){
        throw new Error(err.response?.data?.error||'Unkown error')
    }
}