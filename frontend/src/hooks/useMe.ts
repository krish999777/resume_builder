import {useQuery} from '@tanstack/react-query'
import {getMe} from '../utils/api'

export default function useMe(){
    const query=useQuery({
        queryFn:getMe,
        queryKey:['me']
    })
    return query
}