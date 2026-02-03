import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function TeacherPendingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-10 max-w-md w-full text-center">
        {/* Icône / Loader */}
        <div className="flex justify-center mb-6">
          <Loader2 className="w-12 h-12 text-[#feba45] animate-spin" />
        </div>

        {/* Titre */}
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Votre demande est en cours de validation
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-6">
          Merci pour votre patience ! Un administrateur examine votre demande de
          compte professeur. Vous serez notifié dès que votre compte sera
          activé.
        </p>

        {/* Instructions */}
        <p className="text-sm text-gray-400 mb-6">
          En attendant, vous pouvez explorer l'accueil et préparer vos
          informations pour votre profil.
        </p>

        {/* Bouton retour */}
        <Link
          prefetch
          href="/home"
          className="inline-block w-full bg-[#feba45] hover:bg-[#e59430] text-white font-semibold py-3 rounded-xl transition-colors duration-200"
        >
          Revenir à l’accueil
        </Link>
      </div>
    </div>
  );
}
