import { Link } from "react-router-dom";
import LogoUABC from "../../../assets/images/logo uabc.jpg";

export default function LoginSidebar() {
  return (
    <div className="relative flex h-full basis-1/3 min-w-[200px] bg-green-700">
      <div className="relative m-4 flex-1 overflow-hidden rounded-3xl shadow-2xl">
        <img
          src={LogoUABC}
          alt="UABC Mascota"
          className="h-full w-full object-cover"
        />
        <div className="absolute bottom-6 left-1/2 w-full -translate-x-1/2 px-6 text-center">
          <p className="text-base font-bold text-black">
            ¿Necesitas ayuda?{" "}
            <Link to="/contacto" className="font-bold text-black underline decoration-green-700 underline-offset-4 hover:text-green-800">
              Contáctanos
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
