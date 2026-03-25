import { Navbar } from "./Navbar"


export function Layout ({children}) {




  return(

    <div>
      <Navbar />
      {children}
    </div>
  )
}