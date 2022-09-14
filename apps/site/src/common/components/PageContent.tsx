import { ToastContainer } from "react-toastify"
import { SidebarSpacing } from "./Navbar"
import Toast from "./Toast"

function PageWrapper({ children }: any) {
  return (
    <>
      {/* Navbar here */}
      <div className="min-h-screen w-screen mx-auto flex flex-col">
        <SidebarSpacing />
        {children}
      </div>
    </>
  )
}

export default PageWrapper
