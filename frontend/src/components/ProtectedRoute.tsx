import useMe from '../hooks/useMe'
import Navbar from './Navbar'
import {Navigate} from 'react-router-dom'
import type {JSX} from 'react'
import LoadingSpinner from '../components/LoadingSpinner'
 
export default function ProtectedRoute({children}:{children:JSX.Element}){
    const {isPending,isError,data}=useMe()
    if(isPending){
        return(<LoadingSpinner/>)
    }
    if(isError){
        return <Navigate to="/login"/>
    }
    if(data){
        return(
        <>
            <Navbar userData={data}/>
            {children}
        </>
        )
    }
    return <Navigate to="/login"/>
}