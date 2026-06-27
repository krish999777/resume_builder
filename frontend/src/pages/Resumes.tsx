import './Resumes.css'
import {useState,useEffect} from 'react'
import {useQuery} from '@tanstack/react-query'
import {getResumes} from '../utils/api'
import LoadingSpinner from '../components/LoadingSpinner'
import {useNavigate} from 'react-router-dom'
import { useDebounce } from 'use-debounce'
import ErrorMessage from '../components/ErrorMessage'

export default function Resumes(){
    const [search,setSearch]=useState<string>('')
    const [sort,setSort]=useState<null|'skill'|'creation'>(null)
    const [page,setPage]=useState<number>(1)

    const navigate=useNavigate()

    const [debouncedSearch]=useDebounce(search,500)

    useEffect(() => {
        setPage(1)
    }, [debouncedSearch, sort])

    const {data,isPending,error}=useQuery({
        queryFn:()=>getResumes({search:debouncedSearch,sort,page}),
        queryKey:['resumes',debouncedSearch,sort,page]
    })
    if(error){
        return <ErrorMessage message={error?error.message:'Unknown error'}/>
    }

    function handleSelectChange(e:any){
        setSort(e.target.value==='null'?null:e.target.value)
    }

    return(
        <div className="resumes-wrap">
            <div className="resumes-filters">
                <input
                    type="text"
                    className="resumes-search"
                    placeholder="Search by name, title or skill..."
                    value={search}
                    onChange={(e)=>setSearch(e.target.value)}
                />
                <select className="resumes-sort" value={sort??'null'} onChange={handleSelectChange}>
                    <option value="null">No Sort</option>
                    <option value="skill">Most Skills</option>
                    <option value="creation">Latest</option>
                </select>
            </div>
            {isPending||!data?
            <LoadingSpinner/>
            :
            <>
                <div className="resumes-grid">
                    {data.data.length===0?
                    <div className="resumes-empty">No resumes found</div>
                    :
                    data.data.map(resume=>(
                        <div className="resumes-card" onClick={()=>navigate(`/resumes/${resume.userId}`)} key={resume.userId}>
                            <div className="resumes-card-header">
                                <h3 className="resumes-card-name">{resume.name}</h3>
                                <span className="resumes-card-title">{resume.title}</span>
                            </div>
                            <p className="resumes-card-summary">{resume.summary}</p>
                            <div className="resumes-card-skills">
                                {resume.skills.map((skill,index)=>(
                                    <span key={index} className="resumes-card-skill">{skill}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="resumes-pagination">
                    <button className="resumes-page-btn" disabled={page===1} onClick={()=>setPage(prev=>prev-1)}>←</button>
                    <span className="resumes-page-indicator">Page {page} of {data.totalPages}</span>
                    <button className="resumes-page-btn" disabled={page>=data.totalPages} onClick={()=>setPage(prev=>prev+1)}>→</button>
                </div>
            </>
            }
        </div>
    )
}