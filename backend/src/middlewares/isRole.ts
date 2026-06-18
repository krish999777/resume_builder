import type {Request,Response,NextFunction} from 'express'

export async function isCandidate(req:Request,res:Response,next:NextFunction){
    if(req.role!=='candidate'){
        return res.status(403).json({error:"User role must be candidate to access this endpoint"})
    }
    next()
}
export async function isRecruiter(req:Request,res:Response,next:NextFunction){
    if(req.role!=='recruiter'){
        return res.status(403).json({error:"User role must be recruiter to access this endpoint"})
    }
    next()
}