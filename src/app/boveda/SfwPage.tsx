import React from "react";
import { Shield, Lock, FileKey, CheckCircle2, HardDrive, RefreshCw } from "lucide-react";

export function SfwPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-100 font-sans flex flex-col">
      {/* Navbar */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Shield className="w-5 h-5 text-zinc-950" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Bóveda Secure
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Características</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">Cómo funciona</a>
            <a href="#faq" className="hover:text-white transition-colors">Preguntas Frecuentes</a>
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              v2.4 (Estable)
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 md:py-20 flex flex-col gap-16">
        
        {/* Hero Section */}
        <section className="text-center flex flex-col items-center gap-6">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent max-w-2xl leading-tight">
            Encriptación de Archivos a Nivel de Cliente en Segundos
          </h1>
          <p className="text-zinc-400 max-w-xl text-base md:text-lg leading-relaxed">
            Protege tus archivos personales e información confidencial con encriptación local AES-256. Tus datos nunca salen de tu dispositivo.
          </p>
        </section>

        {/* Encrypter Box UI */}
        <section className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden max-w-xl mx-auto w-full">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-4">
              <Lock className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="font-bold text-sm text-white">Encriptador Local</h3>
                <p className="text-xs text-zinc-500">Procesado 100% en local (Javascript Crypto API)</p>
              </div>
            </div>

            {/* Drop Zone */}
            <div className="border-2 border-dashed border-zinc-800 hover:border-zinc-700 transition-colors rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3 cursor-pointer bg-zinc-900/20">
              <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <FileKey className="w-6 h-6 text-zinc-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-300">Arrastra tu archivo aquí</p>
                <p className="text-xs text-zinc-500 mt-1">o haz clic para explorar tu dispositivo</p>
              </div>
              <p className="text-[10px] text-zinc-600 mt-2">Formatos sugeridos: .zip, .pdf, .docx, .png, .mp4 (Máx. 2GB)</p>
            </div>

            {/* Password input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400">Contraseña de Descifrado</label>
              <input 
                type="password" 
                placeholder="Ingresa una clave segura..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500/50 transition-colors"
                disabled
              />
            </div>

            {/* Encrypt button */}
            <button 
              type="button"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-sm py-3 px-4 rounded-xl transition-all shadow-lg shadow-emerald-600/10 cursor-not-allowed flex items-center justify-center gap-2"
              disabled
            >
              <Lock className="w-4 h-4" />
              Procesar y Descargar Archivo Seguro
            </button>
          </div>
        </section>

        {/* Benefits Grid */}
        <section id="features" className="grid sm:grid-cols-3 gap-6 pt-6 border-t border-zinc-900">
          <div className="flex flex-col gap-3 p-4 bg-zinc-950/40 border border-zinc-900 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <h4 className="font-bold text-sm text-zinc-200">Zero Server Storage</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Los archivos no se transmiten a ningún servidor. La encriptación ocurre puramente en tu navegador web.
            </p>
          </div>

          <div className="flex flex-col gap-3 p-4 bg-zinc-950/40 border border-zinc-900 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-emerald-400" />
            </div>
            <h4 className="font-bold text-sm text-zinc-200">Algoritmo AES-256</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Estándar de encriptación simétrica utilizado a nivel mundial para la protección de datos gubernamentales y militares.
            </p>
          </div>

          <div className="flex flex-col gap-3 p-4 bg-zinc-950/40 border border-zinc-900 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-emerald-400" />
            </div>
            <h4 className="font-bold text-sm text-zinc-200">Compresión Integrada</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Reduce el tamaño del archivo final encriptado para facilitar su almacenamiento y transmisión en canales seguros.
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="flex flex-col gap-6 pt-6 border-t border-zinc-900">
          <h2 className="text-xl font-bold text-white text-center">Preguntas Frecuentes</h2>
          <div className="grid md:grid-cols-2 gap-6 mt-2">
            <div className="flex flex-col gap-2">
              <h5 className="text-sm font-semibold text-zinc-200">¿Qué pasa si olvido la contraseña?</h5>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Dado que no guardamos copias de tus llaves ni de tus archivos, es imposible recuperar tus datos si pierdes la contraseña utilizada durante la encriptación.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <h5 className="text-sm font-semibold text-zinc-200">¿Es seguro para archivos grandes?</h5>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Sí. La herramienta utiliza transmisiones de datos fragmentadas para evitar el desbordamiento de memoria en el navegador, permitiendo procesar archivos de hasta 2GB en la mayoría de computadores.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-8 bg-zinc-950/40 text-center text-xs text-zinc-500 mt-20">
        <p>© 2026 Bóveda Secure Inc. Todos los derechos reservados. Licencia MIT. Procesado en local.</p>
      </footer>
    </div>
  );
}
