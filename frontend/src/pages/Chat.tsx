import './Chat.css'
import { getConversations } from '../utils/api'
import {useQuery} from '@tanstack/react-query'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import useMe from '../hooks/useMe'
import {useState} from 'react'

export default function Chat(){
    const [chat,setChat]=useState<null|number>(null)

    const query=useMe()

    const {data,isPending,error}=useQuery({
        queryFn:getConversations,
        queryKey:['conversations']
    })

    if(isPending){
        return <LoadingSpinner/>
    }

    if(!data||error){
        return <ErrorMessage message={error?.message||'Unknown error'}/>
    }

    if(data.data.length===0){
        return <div>No conversations found. {query.data!.role==='candidate'?'You will see your conversations here when a recruiter messages you':'Message a candidate to start a conversation'}</div>//style this when i tell you to do the css
    }

    return(
        <div>
            <div>
                {data.data.map(convo=>(
                    <div key={convo.id} onClick={()=>setChat(convo.id)}>
                        <div>{convo.name}</div>
                        <div>{new Date(convo.lastMessagedAt).toDateString()}</div>
                    </div>
                ))}
            </div>
            <div>
                {!chat?'Select a chat':(
                    <div>
                        {chat}
                    </div>
                )}
            </div>
        </div>
    )
}