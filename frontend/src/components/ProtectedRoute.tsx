import useMe from '../hooks/useMe'
import Navbar from './Navbar'
import {Navigate} from 'react-router-dom'
import type {JSX} from 'react'
import LoadingSpinner from '../components/LoadingSpinner'
 
export default function ProtectedRoute({children,role}:{children:JSX.Element,role?:'candidate'|'recruiter'}){
    const {isPending,isError,data}=useMe()
    if(isPending){
        return(<LoadingSpinner/>)
    }
    if(isError){
        return <Navigate to="/login"/>
    }
    if(data){
        if(role&&role!==data.role){
            return <Navigate to={data.role==='candidate'?'/resume':'/resumes'}/>
        }
        return(
        <>
            <Navbar userData={data}/>
            {children}
        </>
        )
    }
    return <Navigate to="/login"/>
}