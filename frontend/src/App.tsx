import {BrowserRouter,Routes,Route} from 'react-router-dom'
import Root from './pages/Root'
import Login from './pages/Login'
import Signup from './pages/Signup'

export default function App(){
  return(
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Root/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/signup' element={<Signup/>}/>
      </Routes>
    </BrowserRouter>
  )
}