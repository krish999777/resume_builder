import {useParams} from 'react-router-dom'
import ResumeView from '../components/ResumeView'
import ErrorMessage from '../components/ErrorMessage'

export default function EachResume(){
    const {userId}=useParams()
    const id=Number(userId)
    if(!id){
        return <ErrorMessage message="id must be a number"/>
    }
    return <ResumeView id={id}/>
}