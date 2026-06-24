import {Navigate} from 'react-router-dom'
import useMe from '../hooks/useMe'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Root(){
    const query=useMe()
    if(query.isError){
        return <Navigate to="/login"/>
    }
    if(query.isPending){
        return <LoadingSpinner/>
    }
    if(query.data){
        return <Navigate to={query.data.role==='candidate'?'/resume':'/resumes'}/>
    }
    return <Navigate to="/login"/>
}