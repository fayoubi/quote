import React, { useState } from 'react';
import { User, Shield } from 'lucide-react';

type Person = {
  title: string;
  nom: string;
  prenom: string;
  cin: string;
  nationalite: string;
  passport: string;
  carteSejourTitre: string;
  dateNaissance: string;
  lieuNaissance: string;
  adresse: string;
  ville: string;
  pays: string;
  telephone: string;
  profession: string;
  situationFamiliale: string;
  veuf: boolean;
  nombreEnfants: string;
  citoyenAmericain: string;
  tin: string;
};

interface PersonSectionProps {
  title: string;
  person: Person;
  section: 'subscriber' | 'insured';
  icon: React.ComponentType<{ className?: string }>;
  onChange: (section: 'subscriber' | 'insured', field: keyof Person, value: string | boolean) => void;
}

const PersonSection: React.FC<PersonSectionProps> = ({ title, person, section, icon: Icon, onChange }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-center gap-3 mb-6">
      <Icon className="h-6 w-6 text-blue-600" />
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Title Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Civilité</label>
        <div className="flex gap-4">
          {['M.', 'Mme.', 'Mlle.'].map(civ => (
            <label key={civ} className="flex items-center">
              <input
                type="radio"
                name={`${section}_title`}
                value={civ}
                checked={person.title === civ}
                onChange={(e) => onChange(section, 'title', e.target.value)}
                className="mr-2 text-blue-600"
              />
              {civ}
            </label>
          ))}
        </div>
      </div>

      <div className="md:col-span-2"></div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
        <input
          type="text"
          value={person.nom}
          onChange={(e) => onChange(section, 'nom', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
        <input
          type="text"
          value={person.prenom}
          onChange={(e) => onChange(section, 'prenom', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Pièce d'identité (CIN)</label>
        <input
          type="text"
          value={person.cin}
          onChange={(e) => onChange(section, 'cin', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Nationalité</label>
        <input
          type="text"
          value={person.nationalite}
          onChange={(e) => onChange(section, 'nationalite', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Passeport</label>
        <input
          type="text"
          value={person.passport}
          onChange={(e) => onChange(section, 'passport', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Carte/Titre de séjour</label>
        <input
          type="text"
          value={person.carteSejourTitre}
          onChange={(e) => onChange(section, 'carteSejourTitre', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Date de naissance</label>
        <input
          type="date"
          value={person.dateNaissance}
          onChange={(e) => onChange(section, 'dateNaissance', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Lieu de naissance</label>
        <input
          type="text"
          value={person.lieuNaissance}
          onChange={(e) => onChange(section, 'lieuNaissance', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
        <input
          type="text"
          value={person.adresse}
          onChange={(e) => onChange(section, 'adresse', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
        <input
          type="text"
          value={person.ville}
          onChange={(e) => onChange(section, 'ville', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Pays</label>
        <input
          type="text"
          value={person.pays}
          onChange={(e) => onChange(section, 'pays', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">N° téléphone</label>
        <input
          type="tel"
          value={person.telephone}
          onChange={(e) => onChange(section, 'telephone', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">Profession exacte</label>
        <input
          type="text"
          value={person.profession}
          onChange={(e) => onChange(section, 'profession', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="md:col-span-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">Situation familiale</label>
        <div className="flex gap-6">
          {['Célibataire', 'Marié(e)', 'Divorcé(e)'].map(status => (
            <label key={status} className="flex items-center">
              <input
                type="radio"
                name={`${section}_situation`}
                value={status}
                checked={person.situationFamiliale === status}
                onChange={(e) => onChange(section, 'situationFamiliale', e.target.value)}
                className="mr-2 text-blue-600"
              />
              {status}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={person.veuf}
            onChange={(e) => onChange(section, 'veuf', e.target.checked)}
            className="mr-2 text-blue-600"
          />
          Veuf (ve)
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre d'enfants</label>
        <input
          type="number"
          value={person.nombreEnfants}
          onChange={(e) => onChange(section, 'nombreEnfants', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="md:col-span-3 bg-blue-50 p-4 rounded-lg">
        <p className="text-sm font-medium text-blue-800 mb-3">
          Êtes-vous citoyen américain ou avez-vous votre résidence fiscale aux États-Unis ?*
        </p>
        <div className="flex gap-4 mb-3">
          {['Oui', 'Non'].map(option => (
            <label key={option} className="flex items-center">
              <input
                type="radio"
                name={`${section}_citizen`}
                value={option}
                checked={person.citoyenAmericain === option}
                onChange={(e) => onChange(section, 'citoyenAmericain', e.target.value)}
                className="mr-2 text-blue-600"
              />
              {option}
            </label>
          ))}
        </div>
        <p className="text-xs text-blue-600 mb-2">
          *Si oui, veuillez remplir et signer les annexes complémentaires FATCA
        </p>
        <div>
          <label className="block text-sm font-medium text-blue-800 mb-2">
            Numéro d'identification fiscale (TIN)
          </label>
          <input
            type="text"
            value={person.tin}
            onChange={(e) => onChange(section, 'tin', e.target.value)}
            className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  </div>
);

const InsuranceForm: React.FC = () => {
  const [formData, setFormData] = useState<{ subscriber: Person; insured: Person }>({
    subscriber: {
      title: '', nom: '', prenom: '', cin: '', nationalite: '', passport: '', carteSejourTitre: '', dateNaissance: '', lieuNaissance: '', adresse: '', ville: '', pays: '', telephone: '', profession: '', situationFamiliale: '', veuf: false, nombreEnfants: '', citoyenAmericain: '', tin: ''
    },
    insured: {
      title: '', nom: '', prenom: '', cin: '', nationalite: '', passport: '', carteSejourTitre: '', dateNaissance: '', lieuNaissance: '', adresse: '', ville: '', pays: '', telephone: '', profession: '', situationFamiliale: '', veuf: false, nombreEnfants: '', citoyenAmericain: '', tin: ''
    }
  });

  const handleInputChange = (section: 'subscriber' | 'insured', field: keyof Person, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value as never
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Formulaire d'Assurance</h1>
          <p className="text-gray-600">Souscripteur Assuré - Informations personnelles</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <p className="text-sm text-blue-800">Étape 1 sur 3 - Informations personnelles</p>
          </div>
        </div>

        <div className="space-y-8">
          <PersonSection 
            title="Souscripteur" 
            person={formData.subscriber} 
            section="subscriber"
            icon={User}
            onChange={handleInputChange}
          />

          <PersonSection 
            title="Assuré" 
            person={formData.insured} 
            section="insured"
            icon={Shield}
            onChange={handleInputChange}
          />

          <div className="flex justify-center space-x-4">
            <button
              type="button"
              className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Enregistrer le brouillon
            </button>
            <button
              type="button"
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsuranceForm;
