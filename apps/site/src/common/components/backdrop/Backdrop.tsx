import { FC, ReactNode } from "react"

const Backdrop: FC<{ children: ReactNode; onClick?: any; modalOpen? }> = ({
  children,
  onClick,
  modalOpen,
}) => {
  return (
    <div
      onClick={onClick}
      className="fixed overlay h-screen w-screen top-0 left-0 backdrop-blur-xl z-50 bg-skin-fill/60 blur-md">
      {children}
    </div>
  )
}

export default Backdrop
