import { Link } from "react-router-dom";

function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-green-700 text-white py-6 shadow">
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="text-2xl font-semibold">Centro de ayuda</h1>
          <p className="text-sm opacity-80">
            Estamos aquí para apoyarte con cualquier duda relacionada con el Sistema de Gestión de Comisiones Académicas.
          </p>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-10 space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-800">¿Necesitas soporte?</h2>
            <p className="text-gray-600 leading-relaxed mt-3">
              Usa los siguientes canales para comunicarte con el equipo administrativo. Próximamente añadiremos un formulario
              con seguimiento automatizado y chat en vivo.
            </p>
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            <article className="border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-800">Correo electrónico</h3>
              <p className="text-gray-600 mt-2 text-sm">
                Escríbenos con tu número de empleado, descripción de la duda y archivos de referencia.
              </p>
              <a
                href="mailto:soporte.sgca@uabc.edu.mx"
                className="inline-block mt-4 text-green-700 font-semibold hover:underline"
              >
                soporte.sgca@uabc.edu.mx
              </a>
            </article>

            <article className="border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-800">Extensión telefónica</h3>
              <p className="text-gray-600 mt-2 text-sm">
                Atención de lunes a viernes, 9:00 a 17:00. Ten a la mano el folio de tu comisión o reporte.
              </p>
              <p className="mt-4 text-green-700 font-semibold">+52 (686) 123-4567 ext. 204</p>
            </article>
          </section>

          <section className="border border-dashed border-green-300 rounded-xl p-6 text-gray-600 bg-green-50">
            <h3 className="font-semibold text-gray-800">Próximamente</h3>
            <ul className="list-disc pl-5 space-y-2 mt-2 text-sm">
              <li>Sistema de tickets con seguimiento en tiempo real.</li>
              <li>Base de conocimiento con preguntas frecuentes.</li>
              <li>Chat con el equipo de soporte administrativo.</li>
            </ul>
          </section>

          <div className="text-right">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-5 py-2 bg-green-700 text-white rounded-full text-sm font-medium hover:bg-green-800 transition-colors"
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
