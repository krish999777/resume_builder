import ResumeForm from '../components/ResumeForm'
import {useQuery} from '@tanstack/react-query'
import {getResume} from '../utils/api'
import LoadingSpinner from '../components/LoadingSpinner'
 
export default function EditResume(){
    const {data,isPending,error}=useQuery({
        queryFn:getResume,
        queryKey:['resume']
    })
    if(isPending){
        return <LoadingSpinner/>
    }
    if(error||!data||!data.data){
        return (
            <div>
                {error?error.message:'Unknown error'}
            </div>
        )
    }

    return (<ResumeForm  existingData={data.data} mode='edit'/>)
}