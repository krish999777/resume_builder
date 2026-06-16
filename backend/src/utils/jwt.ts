import jwt from 'jsonwebtoken'

const JWT_SECRET=process.env.JWT_SECRET
export function getToken(payload:{id:number,role:'candidate'|'recruiter'}){
    if(!JWT_SECRET){
        throw new Error('Missing JWT_SECRET in .env file')
    }
    return jwt.sign(payload,JWT_SECRET,{expiresIn:'8h'})
}