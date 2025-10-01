import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  CheckCircle,
  Mail,
  Phone,
  FileText,
  Home,
  Clock,
  AlertCircle
} from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

const EnrollmentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const enrollmentId = searchParams.get('enrollmentId');
  const { width, height } = useWindowSize();

  const [showConfetti, setShowConfetti] = useState(true);
  const [numberOfPieces, setNumberOfPieces] = useState(200);

  // Gradually reduce confetti
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setNumberOfPieces(100);
    }, 3000);

    const timer2 = setTimeout(() => {
      setNumberOfPieces(50);
    }, 5000);

    const timer3 = setTimeout(() => {
      setShowConfetti(false);
    }, 8000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  if (!enrollmentId) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start">
              <AlertCircle className="h-6 w-6 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">Erreur</h3>
                <p className="text-red-700">Identifiant d'inscription manquant.</p>
                <Button
                  onClick={() => navigate('/')}
                  className="mt-4"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Retour à l'accueil
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8">
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={numberOfPieces}
          recycle={numberOfPieces > 50}
          gravity={0.3}
        />
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6 animate-bounce-slow">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Félicitations ! 🎉
          </h1>
          <p className="text-xl text-gray-700 mb-2">
            Votre demande d'inscription a été soumise avec succès
          </p>
          <p className="text-lg text-gray-600">
            Numéro de référence: <span className="font-mono font-semibold text-blue-600">{enrollmentId}</span>
          </p>
        </div>

        {/* Main Success Card */}
        <Card className="p-8 mb-6 shadow-xl">
          <div className="space-y-6">
            {/* What Happens Next */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="h-6 w-6 text-blue-600 mr-3" />
                Prochaines étapes
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                      <span className="text-blue-600 font-semibold">1</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Examen de votre demande</h3>
                    <p className="text-gray-600">
                      Notre équipe va examiner votre demande dans les 24 à 48 heures ouvrables.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                      <span className="text-blue-600 font-semibold">2</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Vérification des documents</h3>
                    <p className="text-gray-600">
                      Nous vérifierons toutes les informations et documents fournis.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                      <span className="text-blue-600 font-semibold">3</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Confirmation finale</h3>
                    <p className="text-gray-600">
                      Une fois approuvée, vous recevrez votre confirmation d'inscription et les détails de votre police.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Comment nous vous contacterons
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start p-4 bg-blue-50 rounded-lg">
                  <Mail className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Par Email</h3>
                    <p className="text-sm text-gray-600">
                      Vous recevrez des mises à jour par email concernant l'état de votre demande.
                    </p>
                  </div>
                </div>

                <div className="flex items-start p-4 bg-green-50 rounded-lg">
                  <Phone className="h-6 w-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Par Téléphone</h3>
                    <p className="text-sm text-gray-600">
                      Notre équipe pourrait vous appeler si des informations supplémentaires sont nécessaires.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <FileText className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800 mb-1">Important</h3>
                  <p className="text-sm text-yellow-700">
                    Veuillez conserver votre numéro de référence <span className="font-mono font-semibold">{enrollmentId}</span> pour toute correspondance future.
                    Un email de confirmation contenant tous les détails a été envoyé à votre adresse email.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Additional Resources */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Besoin d'aide ?
          </h2>
          <div className="space-y-3 text-gray-600">
            <p className="flex items-center">
              <Phone className="h-5 w-5 text-blue-600 mr-3" />
              <span>Service client: <a href="tel:+212-XXX-XXXXXX" className="text-blue-600 hover:underline font-medium">+212 XXX-XXXXXX</a></span>
            </p>
            <p className="flex items-center">
              <Mail className="h-5 w-5 text-blue-600 mr-3" />
              <span>Email: <a href="mailto:support@yadmanx.com" className="text-blue-600 hover:underline font-medium">support@yadmanx.com</a></span>
            </p>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Home className="h-5 w-5 mr-2" />
            Retour à l'accueil
          </Button>

          <Button
            size="lg"
            variant="secondary"
            onClick={() => window.print()}
          >
            <FileText className="h-5 w-5 mr-2" />
            Imprimer cette page
          </Button>
        </div>

        {/* Social Proof */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Rejoignez des milliers de clients satisfaits</p>
          <div className="flex justify-center items-center space-x-2">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className="w-6 h-6 text-yellow-400 fill-current"
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">4.9/5 basé sur 2,500+ avis</p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default EnrollmentSuccess;