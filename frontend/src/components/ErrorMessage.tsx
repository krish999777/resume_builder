import './ErrorMessage.css'

export default function ErrorMessage({message}:{message:string}){
    return(
        <div className="error-page-wrap">
            <div className="error-page-icon">⚠️</div>
            <h2 className="error-page-title">Something went wrong</h2>
            <p className="error-page-message">{message}</p>
            <button className="error-page-retry" onClick={()=>window.location.reload()}>Try Again</button>
        </div>
    )
}