import {BrowserRouter,Routes,Route} from 'react-router-dom'
import Root from './pages/Root'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ProtectedRoute from './components/ProtectedRoute'
import Resume from './pages/Resume'
import CreateResume from './pages/CreateResume'

export default function App(){
  return(
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Root/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/resume' element={
          <ProtectedRoute role='candidate'>
            <Resume/>
          </ProtectedRoute>
        }/>
        <Route path='/resume/create' element={
          <ProtectedRoute role='candidate'>
            <CreateResume/>
          </ProtectedRoute>
        }/>
      </Routes>
    </BrowserRouter>
  )
}