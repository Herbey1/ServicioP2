import { Link } from "react-router-dom";

function ContactPage() {
  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <header className="bg-green-700 text-white py-3 shadow">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-xl font-semibold">Centro de ayuda</h1>
          <p className="text-xs opacity-80">
            Estamos aquí para apoyarte con cualquier duda relacionada con el Sistema de Gestión de Comisiones Académicas.
          </p>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl p-6 space-y-5">
          <section>
            <h2 className="text-lg font-semibold text-gray-800">¿Necesitas soporte?</h2>
            <p className="text-gray-600 mt-2 text-sm">
              Usa los siguientes canales para comunicarte con el equipo administrativo. Próximamente añadiremos un formulario
              con seguimiento automatizado y chat en vivo.
            </p>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <article className="border border-gray-200 rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold text-gray-800 text-sm">Correo electrónico</h3>
              <p className="text-gray-600 mt-1 text-xs">
                Escríbenos con tu número de empleado, descripción de la duda y archivos de referencia.
              </p>
              <a
                href="mailto:ejemplo@uabc.edu.mx"
                className="inline-block mt-2 text-green-700 font-semibold hover:underline text-sm"
              >
                ejemplo@uabc.edu.mx
              </a>
            </article>

            <article className="border border-gray-200 rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold text-gray-800 text-sm">Extensión telefónica</h3>
              <p className="text-gray-600 mt-1 text-xs">
                Atención de lunes a viernes, 9:00 a 17:00. Ten a la mano el folio de tu comisión o reporte.
              </p>
              <p className="mt-2 text-green-700 font-semibold text-sm">664-123-4567</p>
            </article>
          </section>

          <div className="text-right">
            <Link
              to="/login"
              className="inline-flex items-center gap-1 px-4 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 transition-colors"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ContactPage;
