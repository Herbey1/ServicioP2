import { Link } from "react-router-dom";
import LogoUABC from "../../../assets/images/UABClogo.png";
import { InformationCircleIcon, AcademicCapIcon } from "../../common/Icons";

export default function LoginSidebar() {
  return (
    <div className="hidden lg:flex h-screen w-full max-w-md bg-green-700 no-overlap p-6 xl:p-8">
      <div className="relative w-full h-full overflow-hidden rounded-2xl shadow-2xl bg-white/10 backdrop-blur-sm container-safe">
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        {/* Content */}
        <div className="relative flex flex-col h-full p-4 xl:p-6">
          
          {/* Header */}
          <div className="text-center mb-4 xl:mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 xl:w-14 xl:h-14 bg-white/20 rounded-full mb-2 xl:mb-3">
              <AcademicCapIcon className="h-6 w-6 xl:h-7 xl:w-7 text-white" />
            </div>
            <h1 className="text-lg xl:text-xl font-bold text-white mb-1">
              SGCA - FCQI
            </h1>
            <p className="text-green-100 text-xs xl:text-sm">
              Universidad Autónoma de Baja California
            </p>
          </div>

          {/* Main Image */}
          <div className="flex-1 flex items-center justify-center mb-4 xl:mb-6 min-h-0">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-xl"></div>
              <img
                loading="lazy"
                src={LogoUABC}
                alt="UABC - Mascota Universitaria"
                className="relative h-32 w-32 xl:h-40 xl:w-40 object-contain drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3 xl:space-y-4 mb-6 xl:mb-8">
            <div className="flex items-center space-x-3 text-white/90">
              <div className="w-2 h-2 bg-green-300 rounded-full flex-shrink-0"></div>
              <span className="text-sm">Gestión de solicitudes de comisiones</span>
            </div>
            <div className="flex items-center space-x-3 text-white/90">
              <div className="w-2 h-2 bg-green-300 rounded-full flex-shrink-0"></div>
              <span className="text-sm">Seguimiento de reportes académicos</span>
            </div>
            <div className="flex items-center space-x-3 text-white/90">
              <div className="w-2 h-2 bg-green-300 rounded-full flex-shrink-0"></div>
              <span className="text-sm">Administración centralizada</span>
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-white/10 rounded-xl p-4 xl:p-6 backdrop-blur-sm border border-white/20">
            <div className="flex items-center space-x-2 mb-3">
              <InformationCircleIcon className="h-5 w-5 text-green-200 flex-shrink-0" />
              <span className="text-green-100 font-medium text-sm xl:text-base">¿Necesitas ayuda?</span>
            </div>
            <p className="text-white/80 text-sm mb-4">
              Si tienes problemas para acceder o necesitas soporte técnico, nuestro equipo está aquí para ayudarte.
            </p>
            <Link 
              to="/contacto" 
              className="inline-flex items-center justify-center w-full px-4 py-2 
                       bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg 
                       transition-all duration-200 backdrop-blur-sm border border-white/30
                       focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
            >
              Contáctanos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
