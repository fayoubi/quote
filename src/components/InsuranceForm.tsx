import React, { useEffect, useState } from 'react';
import { User, Shield } from 'lucide-react';
import { nationalitiesFr } from '../constants/nationalitiesFr';

// Minimal French → English country mapping for the cities package
const frToEnCountry: Record<string, string> = {
  'Maroc': 'Morocco',
  'France': 'France',
  'Allemagne': 'Germany',
  'Espagne': 'Spain',
  'Royaume-Uni': 'United Kingdom',
  'Italie': 'Italy',
  'Belgique': 'Belgium',
  'Pays-Bas': 'Netherlands',
  'Portugal': 'Portugal',
  'Suisse': 'Switzerland',
  'États-Unis': 'United States',
  'Canada': 'Canada',
  'Algérie': 'Algeria',
  'Tunisie': 'Tunisia',
  'Turquie': 'Turkey',
  'Chine': 'China',
  'Inde': 'India',
};

const NoIcon: React.FC<{ className?: string }> = () => null;

type Person = {
  salutation: string;
  lastName: string;
  firstName: string;
  idNumber: string;
  nationality: string;
  passportNumber: string;
  residencePermit: string;
  birthDate: string;
  birthPlace: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  occupation: string;
  maritalStatus: string;
  widowed: boolean;
  numberOfChildren: string;
  usCitizen: string;
  tin: string;
};

const emptyPerson: Person = {
  salutation: '',
  lastName: '',
  firstName: '',
  idNumber: '',
  nationality: '',
  passportNumber: '',
  residencePermit: '',
  birthDate: '',
  birthPlace: '',
  address: '',
  city: '',
  country: '',
  phone: '',
  occupation: '',
  maritalStatus: '',
  widowed: false,
  numberOfChildren: '',
  usCitizen: '',
  tin: ''
};

interface PersonSectionProps {
  title: string;
  person: Person;
  section: 'subscriber' | 'insured';
  icon: React.ComponentType<{ className?: string }>;
  onChange: (section: 'subscriber' | 'insured', field: keyof Person, value: string | boolean) => void;
  readOnly?: boolean;
  cities: string[];
  isLoadingCities?: boolean;
}

const PersonSection: React.FC<PersonSectionProps> = ({ title, person, section, icon: Icon, onChange, readOnly, cities, isLoadingCities }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-center gap-3 mb-6">
      <Icon className="h-6 w-6 text-blue-600" />
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Civilité */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Civilité</label>
        <div className="flex gap-4">
          {['M.', 'Mme.', 'Mlle.'].map(civ => (
            <label key={civ} className="flex items-center">
              <input
                type="radio"
                name={`${section}_salutation`}
                value={civ}
                checked={person.salutation === civ}
                onChange={(e) => !readOnly && onChange(section, 'salutation', e.target.value)}
                className="mr-2 text-blue-600"
                disabled={readOnly}
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
          value={person.lastName}
          onChange={(e) => !readOnly && onChange(section, 'lastName', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
          readOnly={readOnly}
          aria-disabled={readOnly}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
        <input
          type="text"
          value={person.firstName}
          onChange={(e) => !readOnly && onChange(section, 'firstName', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
          readOnly={readOnly}
          aria-disabled={readOnly}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Pièce d'identité (CIN)</label>
        <input
          type="text"
          value={person.idNumber}
          onChange={(e) => !readOnly && onChange(section, 'idNumber', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          readOnly={readOnly}
          aria-disabled={readOnly}
        />
      </div>

      <div className="md:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nationalité</label>
          <div className="relative">
            <select
              value={person.nationality}
              onChange={(e) => {
                if (readOnly) return;
                onChange(section, 'nationality', e.target.value);
                onChange(section, 'city', ''); // reset city when nationality changes
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              disabled={readOnly}
              aria-disabled={readOnly}
            >
              <option value="">Sélectionnez une nationalité</option>
              {nationalitiesFr.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
          <div className="relative">
            <select
              value={person.city}
              onChange={(e) => !readOnly && onChange(section, 'city', e.target.value)}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none ${!person.nationality || readOnly ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'}`}
              disabled={!person.nationality || readOnly || (!!person.nationality && (isLoadingCities ?? false))}
              aria-disabled={!person.nationality || readOnly}
            >
              <option value="">{!person.nationality ? 'Sélectionnez une nationalité d’abord' : (isLoadingCities ? 'Chargement…' : 'Sélectionnez une ville')}</option>
              {cities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Passeport</label>
        <input
          type="text"
          value={person.passportNumber}
          onChange={(e) => !readOnly && onChange(section, 'passportNumber', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          readOnly={readOnly}
          aria-disabled={readOnly}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Carte/Titre de séjour</label>
        <input
          type="text"
          value={person.residencePermit}
          onChange={(e) => !readOnly && onChange(section, 'residencePermit', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          readOnly={readOnly}
          aria-disabled={readOnly}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Date de naissance</label>
        <input
          type="date"
          value={person.birthDate}
          onChange={(e) => !readOnly && onChange(section, 'birthDate', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          readOnly={readOnly}
          aria-disabled={readOnly}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Lieu de naissance</label>
        <input
          type="text"
          value={person.birthPlace}
          onChange={(e) => !readOnly && onChange(section, 'birthPlace', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          readOnly={readOnly}
          aria-disabled={readOnly}
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
        <input
          type="text"
          value={person.address}
          onChange={(e) => !readOnly && onChange(section, 'address', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          readOnly={readOnly}
          aria-disabled={readOnly}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Pays</label>
        <input
          type="text"
          value={person.country}
          onChange={(e) => !readOnly && onChange(section, 'country', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          readOnly={readOnly}
          aria-disabled={readOnly}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">N° téléphone</label>
        <input
          type="tel"
          value={person.phone}
          onChange={(e) => !readOnly && onChange(section, 'phone', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          readOnly={readOnly}
          aria-disabled={readOnly}
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">Profession exacte</label>
        <input
          type="text"
          value={person.occupation}
          onChange={(e) => !readOnly && onChange(section, 'occupation', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          readOnly={readOnly}
          aria-disabled={readOnly}
        />
      </div>

      <div className="md:col-span-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">Situation familiale</label>
        <div className="flex gap-6">
          {['Célibataire', 'Marié(e)', 'Divorcé(e)', 'Veuf (ve)'].map(status => (
            <label key={status} className="flex items-center">
              <input
                type="radio"
                name={`${section}_maritalStatus`}
                value={status}
                checked={person.maritalStatus === status}
                onChange={(e) => {
                  if (readOnly) return;
                  onChange(section, 'maritalStatus', e.target.value);
                  onChange(section, 'widowed', e.target.value === 'Veuf (ve)');
                }}
                className="mr-2 text-blue-600"
                disabled={readOnly}
              />
              {status}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre d'enfants</label>
        <input
          type="number"
          value={person.numberOfChildren}
          onChange={(e) => !readOnly && onChange(section, 'numberOfChildren', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          readOnly={readOnly}
          aria-disabled={readOnly}
        />
      </div>

      <div className="md:col-span-3 p-0">
        <p className="text-sm font-medium text-gray-700 mb-3">
          Êtes-vous citoyen américain ou avez-vous votre résidence fiscale aux États-Unis ?
        </p>
        <div className="flex gap-4 mb-3">
          {['Oui', 'Non'].map(option => (
            <label key={option} className="flex items-center">
              <input
                type="radio"
                name={`${section}_usCitizen`}
                value={option}
                checked={person.usCitizen === option}
                onChange={(e) => !readOnly && onChange(section, 'usCitizen', e.target.value)}
                className="mr-2 text-blue-600"
                disabled={readOnly}
              />
              {option}
            </label>
          ))}
        </div>
        {person.usCitizen === 'Oui' && (
          <div className="mt-2 ml-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numéro d'identification fiscale (TIN)
            </label>
            <input
              type="text"
              value={person.tin}
              onChange={(e) => !readOnly && onChange(section, 'tin', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              readOnly={readOnly}
              aria-disabled={readOnly}
            />
          </div>
        )}
      </div>
    </div>
  </div>
);

const InsuranceForm: React.FC = () => {
  const [insuredSameAsSubscriber, setInsuredSameAsSubscriber] = useState<boolean>(true);
  const [formData, setFormData] = useState<{ subscriber: Person; insured: Person }>({
    subscriber: { ...emptyPerson },
    insured: { ...emptyPerson }
  });
  const [lastManualInsured, setLastManualInsured] = useState<Person | null>(null);
  const [citiesSubscriber, setCitiesSubscriber] = useState<string[]>([]);
  const [citiesInsured, setCitiesInsured] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState<{ subscriber: boolean; insured: boolean }>({ subscriber: false, insured: false });

  const handleInputChange = (section: 'subscriber' | 'insured', field: keyof Person, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value as never
      }
    }));
    if (section === 'insured' && !insuredSameAsSubscriber) {
      setLastManualInsured(prev => ({ ...(prev ?? emptyPerson), [field]: value } as Person));
    }
  };

  // Sync insured with subscriber when the toggle is ON
  useEffect(() => {
    if (insuredSameAsSubscriber) {
      setFormData(prev => ({ ...prev, insured: { ...prev.subscriber } }));
      // Also mirror cities options to insured
      setCitiesInsured(citiesSubscriber);
    }
  }, [insuredSameAsSubscriber, formData.subscriber, citiesSubscriber]);

  // Lazy-load cities when nationality changes
  useEffect(() => {
    const nat = formData.subscriber.nationality;
    if (!nat) { setCitiesSubscriber([]); return; }
    const en = frToEnCountry[nat] ?? nat;
    setLoadingCities(prev => ({ ...prev, subscriber: true }));
    import('country-city').then(mod => {
      const list: string[] = (mod as any).getCities ? (mod as any).getCities(en) : [];
      setCitiesSubscriber(Array.isArray(list) ? list : []);
    }).catch(() => setCitiesSubscriber([])).finally(() => setLoadingCities(prev => ({ ...prev, subscriber: false })));
  }, [formData.subscriber.nationality]);

  useEffect(() => {
    if (insuredSameAsSubscriber) { return; }
    const nat = formData.insured.nationality;
    if (!nat) { setCitiesInsured([]); return; }
    const en = frToEnCountry[nat] ?? nat;
    setLoadingCities(prev => ({ ...prev, insured: true }));
    import('country-city').then(mod => {
      const list: string[] = (mod as any).getCities ? (mod as any).getCities(en) : [];
      setCitiesInsured(Array.isArray(list) ? list : []);
    }).catch(() => setCitiesInsured([])).finally(() => setLoadingCities(prev => ({ ...prev, insured: false })));
  }, [formData.insured.nationality, insuredSameAsSubscriber]);

  const handleToggleInsuredSame = (value: 'Oui' | 'Non') => {
    if (value === 'Oui') {
      // Snapshot current manual insured before overwriting
      setLastManualInsured(formData.insured);
      setInsuredSameAsSubscriber(true);
      setFormData(prev => ({ ...prev, insured: { ...prev.subscriber } }));
    } else {
      setInsuredSameAsSubscriber(false);
      // Restore last manual insured if available
      setFormData(prev => ({ ...prev, insured: lastManualInsured ? { ...lastManualInsured } : { ...emptyPerson } }));
    }
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
            cities={citiesSubscriber}
            isLoadingCities={loadingCities.subscriber}
          />

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800">Assuré</h2>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">L’assuré est le même que le souscripteur ?</label>
              <div className="flex gap-6">
                {['Oui', 'Non'].map(opt => (
                  <label key={opt} className="flex items-center">
                    <input
                      type="radio"
                      name="insured_same"
                      value={opt}
                      checked={insuredSameAsSubscriber ? opt === 'Oui' : opt === 'Non'}
                      onChange={(e) => handleToggleInsuredSame(e.target.value as 'Oui' | 'Non')}
                      className="mr-2 text-blue-600"
                    />
                    {opt}
                  </label>
                ))}
              </div>
              {insuredSameAsSubscriber && (
                <p className="text-xs text-blue-700 mt-2">Cette section est synchronisée avec le souscripteur et n’est pas modifiable.</p>
              )}
            </div>
            <div className={insuredSameAsSubscriber ? 'opacity-60 transition-opacity' : ''} aria-disabled={insuredSameAsSubscriber}>
              <PersonSection
                title=""
                person={formData.insured}
                section="insured"
                icon={NoIcon}
                onChange={handleInputChange}
                cities={insuredSameAsSubscriber ? citiesSubscriber : citiesInsured}
                isLoadingCities={insuredSameAsSubscriber ? loadingCities.subscriber : loadingCities.insured}
                readOnly={insuredSameAsSubscriber}
              />
            </div>
          </div>

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
