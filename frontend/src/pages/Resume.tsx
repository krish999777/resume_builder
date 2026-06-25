import {useEffect} from 'react'
import {useQuery} from '@tanstack/react-query'
import {getResume} from '../utils/api'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

export default function Resume(){
    const {data,isPending,error}=useQuery({
        queryFn:getResume,
        queryKey:['resume'],
        
    })
    if(isPending){//!data is for ts
        return <LoadingSpinner/>
    }
    if(!data||error){
        console.log(error)
        return
    }
    toast.success(data.message)
    console.log(error,data)
    return(
        <div>
            <div>{data.data.title}</div>

        </div>
    )
}