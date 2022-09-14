import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import React from "react"

function Toast() {
  return (
    <>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        theme="dark"
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  )
}

export default Toast
