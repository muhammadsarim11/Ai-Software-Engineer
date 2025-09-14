import { UserContext, UserProvider } from "../context/User.context"
import AppRoutes from "../routes/AppRoutes"


const App = () => {
  return (
    <UserProvider>
    
    <AppRoutes/>


    </UserProvider>

  
  )
}

export default App
