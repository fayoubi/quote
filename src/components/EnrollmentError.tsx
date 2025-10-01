import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  XCircle,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  Phone,
  Mail,
  Home
} from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';

const EnrollmentError: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const enrollmentId = searchParams.get('enrollmentId');
  const errorCode = searchParams.get('errorCode') || 'UNKNOWN_ERROR';
  const errorMessage = searchParams.get('errorMessage') || 'Une erreur inattendue s\'est produite';

  const getErrorDetails = (code: string) => {
    const errorMap: Record<string, { title: string; description: string; severity: 'error' | 'warning' }> = {
      VALIDATION_ERROR: {
        title: 'Erreur de validation',
        description: 'Certaines informations fournies sont invalides ou manquantes.',
        severity: 'warning'
      },
      NETWORK_ERROR: {
        title: 'Erreur de connexion',
        description: 'Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet.',
        severity: 'error'
      },
      SERVER_ERROR: {
        title: 'Erreur du serveur',
        description: 'Le serveur a rencontré une erreur lors du traitement de votre demande.',
        severity: 'error'
      },
      DUPLICATE_ENROLLMENT: {
        title: 'Inscription existante',
        description: 'Une inscription avec ces informations existe déjà dans notre système.',
        severity: 'warning'
      },
      PAYMENT_ERROR: {
        title: 'Erreur de paiement',
        description: 'Les informations de paiement n\'ont pas pu être validées.',
        severity: 'error'
      },
      INCOMPLETE_DATA: {
        title: 'Données incomplètes',
        description: 'Certaines sections de l\'inscription sont incomplètes.',
        severity: 'warning'
      },
      UNKNOWN_ERROR: {
        title: 'Erreur inconnue',
        description: 'Une erreur inattendue s\'est produite.',
        severity: 'error'
      }
    };

    return errorMap[code] || errorMap.UNKNOWN_ERROR;
  };

  const errorDetails = getErrorDetails(errorCode);
  const isWarning = errorDetails.severity === 'warning';

  const handleRetry = () => {
    if (enrollmentId) {
      navigate(`/enroll/confirmation?enrollmentId=${enrollmentId}`);
    } else {
      navigate('/enroll/start');
    }
  };

  const handleStartOver = () => {
    navigate('/enroll/start');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Error Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${
            isWarning ? 'bg-yellow-100' : 'bg-red-100'
          }`}>
            {isWarning ? (
              <AlertTriangle className="h-16 w-16 text-yellow-600" />
            ) : (
              <XCircle className="h-16 w-16 text-red-600" />
            )}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {errorDetails.title}
          </h1>
          <p className="text-xl text-gray-600">
            Nous n'avons pas pu finaliser votre inscription
          </p>
        </div>

        {/* Error Details Card */}
        <Card className={`p-8 mb-6 border-2 ${
          isWarning ? 'border-yellow-200 bg-yellow-50' : 'border-red-200 bg-red-50'
        }`}>
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Détails de l'erreur
              </h2>
              <p className="text-gray-700">
                {errorDetails.description}
              </p>
            </div>

            {errorMessage && errorMessage !== 'Une erreur inattendue s\'est produite' && (
              <div className={`p-4 rounded-lg border ${
                isWarning ? 'bg-yellow-100 border-yellow-300' : 'bg-red-100 border-red-300'
              }`}>
                <p className={`text-sm ${isWarning ? 'text-yellow-800' : 'text-red-800'}`}>
                  <strong>Message technique:</strong> {errorMessage}
                </p>
              </div>
            )}

            {enrollmentId && (
              <div className="border-t border-gray-300 pt-4">
                <p className="text-sm text-gray-600">
                  <strong>Numéro de référence:</strong> <span className="font-mono">{enrollmentId}</span>
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Suggested Actions */}
        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Que faire maintenant ?
          </h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Réessayer</h3>
                <p className="text-gray-600">
                  Cliquez sur le bouton "Réessayer" ci-dessous pour tenter à nouveau la soumission.
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
                <h3 className="text-lg font-medium text-gray-900">Vérifier vos informations</h3>
                <p className="text-gray-600">
                  Retournez à la page de confirmation et vérifiez que toutes les informations sont correctes.
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
                <h3 className="text-lg font-medium text-gray-900">Contacter le support</h3>
                <p className="text-gray-600">
                  Si le problème persiste, n'hésitez pas à contacter notre équipe de support.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Contact Support */}
        <Card className="p-6 mb-6 bg-blue-50 border border-blue-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Besoin d'aide immédiate ?
          </h2>
          <p className="text-gray-600 mb-4">
            Notre équipe de support est disponible pour vous aider à résoudre ce problème.
          </p>
          <div className="space-y-3">
            <p className="flex items-center text-gray-700">
              <Phone className="h-5 w-5 text-blue-600 mr-3" />
              <span>Service client: <a href="tel:+212-XXX-XXXXXX" className="text-blue-600 hover:underline font-medium">+212 XXX-XXXXXX</a></span>
            </p>
            <p className="flex items-center text-gray-700">
              <Mail className="h-5 w-5 text-blue-600 mr-3" />
              <span>Email: <a href="mailto:support@yadmanx.com" className="text-blue-600 hover:underline font-medium">support@yadmanx.com</a></span>
            </p>
          </div>
          {enrollmentId && (
            <div className="mt-4 p-3 bg-white rounded border border-blue-300">
              <p className="text-sm text-gray-600">
                <strong>Note:</strong> Mentionnez le numéro de référence <span className="font-mono font-semibold text-blue-600">{enrollmentId}</span> lors de votre prise de contact.
              </p>
            </div>
          )}
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={handleRetry}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Réessayer
          </Button>

          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate(`/enroll/confirmation?enrollmentId=${enrollmentId}`)}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour à la confirmation
          </Button>

          <Button
            size="lg"
            variant="secondary"
            onClick={handleStartOver}
          >
            <Home className="h-5 w-5 mr-2" />
            Recommencer
          </Button>
        </div>

        {/* Error Code Reference */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Code d'erreur: <span className="font-mono font-semibold">{errorCode}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentError;