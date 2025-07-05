import { Outlet, Link } from 'react-router-dom'
import Logo from '@/assets/logo.svg'

const AuthLayout = () => {
  return (
    <div className="min-h-svh flex flex-col items-center justify-center bg-gray-50 py-6 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex  space-x-2 items-center mb-4 md:mb-6">
        <Link to="/">
          <img src={Logo} alt="Yiodara Logo" className="h-14 md:h-16 w-auto" />
        </Link>
        <h2 className="md:mt-4 text-2xl md:text-3xl font-extrabold text-gray-900 font-raleway">
          Yiodara
        </h2>
      </div>
      <div className="w-full max-w-sm md:max-w-md p-4 md:p-8 space-y-6 md:space-y-8 bg-white shadow-lg rounded-xl">
        <Outlet />
      </div>
    </div>
  )
}

export default AuthLayout
