import { LocationEntity } from '../types';

export interface TamilNaduDivision {
  name: string;
  taluks: string[];
}

export interface TamilNaduDistrict {
  id: string;
  name: string;
  capital: string;
  lat: number;
  lng: number;
  elevationMsl: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  riskScore: number;
  rainfall24h: number;
  soilMoisture: number;
  temperatureC: number;
  humidity: number;
  faultSlipRate: number;
  hazardDescription: string;
  revenueDivisions: TamilNaduDivision[];
}

export interface StackTaluk {
  name: string;
  revenueDivision: string;
  villages: LocationEntity[];
}

export interface StackDistrict {
  name: string;
  capital: string;
  state: string;
  revenueDivisionsCount: number;
  taluksCount: number;
  taluks: StackTaluk[];
  districtEntity: LocationEntity;
}

// Complete Master Database of all 38 Districts of Tamil Nadu
// Matching Government of Tamil Nadu Official Hierarchy:
// Districts: 38 | Revenue Divisions: 87 | Taluks: 310
export const TAMIL_NADU_DISTRICTS: TamilNaduDistrict[] = [
  {
    id: 'dist-nilgiris',
    name: 'The Nilgiris',
    capital: 'Udhagamandalam (Ooty)',
    lat: 11.4102,
    lng: 76.695,
    elevationMsl: 2240,
    riskLevel: 'CRITICAL',
    riskScore: 92,
    rainfall24h: 184,
    soilMoisture: 84.5,
    temperatureC: 16.2,
    humidity: 95,
    faultSlipRate: 4.6,
    hazardDescription: 'Critical Western Ghats escarpment shear stress. High liquefaction and slope creep along Ooty-Coonoor Ghat.',
    revenueDivisions: [
      { name: 'Coonoor', taluks: ['Coonoor', 'Kotagiri', 'Kundah'] },
      { name: 'Gudalur', taluks: ['Udhagamandalam', 'Gudalur', 'Pandalur'] },
    ],
  },
  {
    id: 'dist-chennai',
    name: 'Chennai',
    capital: 'Chennai',
    lat: 13.0827,
    lng: 80.2707,
    elevationMsl: 7,
    riskLevel: 'HIGH',
    riskScore: 81,
    rainfall24h: 135,
    soilMoisture: 79.2,
    temperatureC: 31.4,
    humidity: 89,
    faultSlipRate: 1.1,
    hazardDescription: 'Coastal storm surge & high urban inundation risk across Adyar, Cooum and Buckingham canal basins.',
    revenueDivisions: [
      { name: 'North Chennai', taluks: ['Tondiarpet', 'Tiruvottiyur', 'Madhavaram', 'Perambur', 'Purasawalkam'] },
      { name: 'Central Chennai', taluks: ['Egmore', 'Aminjikarai', 'Ayanavaram', 'Mambalam', 'Ambattur', 'Maduravoyal'] },
      { name: 'South Chennai', taluks: ['Guindy', 'Mylapore', 'Velachery', 'Alandur', 'Sholinganallur'] },
    ],
  },
  {
    id: 'dist-coimbatore',
    name: 'Coimbatore',
    capital: 'Coimbatore',
    lat: 11.0168,
    lng: 76.9558,
    elevationMsl: 411,
    riskLevel: 'HIGH',
    riskScore: 76,
    rainfall24h: 96,
    soilMoisture: 72.8,
    temperatureC: 28.5,
    humidity: 78,
    faultSlipRate: 2.8,
    hazardDescription: 'Palghat Gap seismic micro-tremor monitoring & Valparai tea plateau slope runoff alerts.',
    revenueDivisions: [
      { name: 'Coimbatore North', taluks: ['Coimbatore North', 'Mettupalayam', 'Annur'] },
      { name: 'Coimbatore South', taluks: ['Coimbatore South', 'Perur', 'Madukkarai', 'Sulur'] },
      { name: 'Pollachi', taluks: ['Pollachi', 'Kinathukadavu', 'Valparai', 'Anaimalai'] },
    ],
  },
  {
    id: 'dist-dindigul',
    name: 'Dindigul',
    capital: 'Dindigul',
    lat: 10.3673,
    lng: 77.9803,
    elevationMsl: 268,
    riskLevel: 'HIGH',
    riskScore: 83,
    rainfall24h: 128,
    soilMoisture: 77.1,
    temperatureC: 27.2,
    humidity: 82,
    faultSlipRate: 3.4,
    hazardDescription: 'Kodaikanal Palani Hill range slope instability and debris flow risk on Ghat Road section.',
    revenueDivisions: [
      { name: 'Dindigul', taluks: ['Dindigul East', 'Dindigul West', 'Attur', 'Natham', 'Kodaikanal', 'Nilakottai'] },
      { name: 'Palani', taluks: ['Palani', 'Oddanchatram', 'Vedasandur', 'Gujiliamparai'] },
    ],
  },
  {
    id: 'dist-theni',
    name: 'Theni',
    capital: 'Theni',
    lat: 10.0104,
    lng: 77.4768,
    elevationMsl: 290,
    riskLevel: 'CRITICAL',
    riskScore: 88,
    rainfall24h: 152,
    soilMoisture: 81.3,
    temperatureC: 26.8,
    humidity: 86,
    faultSlipRate: 3.9,
    hazardDescription: 'Bodinayakanur-Munnar Ghat rockfall alert zone & Mullaperiyar catchment overflow monitoring.',
    revenueDivisions: [
      { name: 'Theni', taluks: ['Theni', 'Periyakulam', 'Andipatti'] },
      { name: 'Uthamapalayam', taluks: ['Bodinayakanur', 'Uthamapalayam'] },
    ],
  },
  {
    id: 'dist-salem',
    name: 'Salem',
    capital: 'Salem',
    lat: 11.6643,
    lng: 78.146,
    elevationMsl: 278,
    riskLevel: 'MODERATE',
    riskScore: 68,
    rainfall24h: 74,
    soilMoisture: 65.4,
    temperatureC: 31.0,
    humidity: 74,
    faultSlipRate: 2.1,
    hazardDescription: 'Shevaroy Hills (Yercaud) hairpin bend slope displacement and Mettur Dam surplus discharge.',
    revenueDivisions: [
      { name: 'Salem', taluks: ['Salem', 'Salem West', 'Salem South', 'Yercaud', 'Sankari', 'Edappadi'] },
      { name: 'Attur', taluks: ['Attur', 'Gangavalli', 'Pethanaickenpalayam', 'Valapady'] },
      { name: 'Mettur', taluks: ['Mettur', 'Omalur', 'Kadayampatti'] },
    ],
  },
  {
    id: 'dist-kanyakumari',
    name: 'Kanyakumari',
    capital: 'Nagercoil',
    lat: 8.0883,
    lng: 77.5385,
    elevationMsl: 10,
    riskLevel: 'HIGH',
    riskScore: 84,
    rainfall24h: 160,
    soilMoisture: 85.0,
    temperatureC: 29.2,
    humidity: 92,
    faultSlipRate: 1.9,
    hazardDescription: 'Arabian Sea-Bay of Bengal confluence oceanic swell surge, cyclonic squalls & Pechiparai flood gauge alert.',
    revenueDivisions: [
      { name: 'Nagercoil', taluks: ['Agastheeswaram', 'Thovalai', 'Killiyoor'] },
      { name: 'Padmanabhapuram', taluks: ['Kalkulam', 'Vilavancode', 'Thiruvattar'] },
    ],
  },
  {
    id: 'dist-cuddalore',
    name: 'Cuddalore',
    capital: 'Cuddalore',
    lat: 11.748,
    lng: 79.7714,
    elevationMsl: 6,
    riskLevel: 'HIGH',
    riskScore: 82,
    rainfall24h: 140,
    soilMoisture: 80.5,
    temperatureC: 30.6,
    humidity: 87,
    faultSlipRate: 1.2,
    hazardDescription: 'High coastal cyclone vulnerability zone. Gadilam & Pennaiyar river delta flood crest alert.',
    revenueDivisions: [
      { name: 'Cuddalore', taluks: ['Cuddalore', 'Panruti', 'Kurinjipadi'] },
      { name: 'Chidambaram', taluks: ['Chidambaram', 'Kattumannarkoil', 'Bhuvanagiri', 'Srimushnam'] },
      { name: 'Virudhachalam', taluks: ['Virudhachalam', 'Tittagudi', 'Veppur'] },
    ],
  },
  {
    id: 'dist-tirunelveli',
    name: 'Tirunelveli',
    capital: 'Tirunelveli',
    lat: 8.7139,
    lng: 77.7567,
    elevationMsl: 47,
    riskLevel: 'HIGH',
    riskScore: 79,
    rainfall24h: 118,
    soilMoisture: 75.3,
    temperatureC: 30.2,
    humidity: 83,
    faultSlipRate: 2.3,
    hazardDescription: 'Tamirabarani river basin hydrological surges and Western Ghats Manjolai hill slope monitoring.',
    revenueDivisions: [
      { name: 'Tirunelveli', taluks: ['Tirunelveli', 'Palayamkottai', 'Manur', 'Tisayanvilai'] },
      { name: 'Cheranmahadevi', taluks: ['Ambasamudram', 'Cheranmahadevi', 'Nanguneri', 'Radhapuram'] },
    ],
  },
  {
    id: 'dist-tenkasi',
    name: 'Tenkasi',
    capital: 'Tenkasi',
    lat: 8.9594,
    lng: 77.3155,
    elevationMsl: 143,
    riskLevel: 'HIGH',
    riskScore: 80,
    rainfall24h: 132,
    soilMoisture: 77.8,
    temperatureC: 27.5,
    humidity: 85,
    faultSlipRate: 2.7,
    hazardDescription: 'Courtallam Western Ghat foothills flash cataract surges and Sengottai rail-ghat boulder creep.',
    revenueDivisions: [
      { name: 'Tenkasi', taluks: ['Tenkasi', 'Sengottai', 'Kadayanallur', 'Alangulam'] },
      { name: 'Sankarankovil', taluks: ['Sankarankovil', 'Sivagiri', 'Veerakeralamputhur', 'Thiruvengadam'] },
    ],
  },
  {
    id: 'dist-chengalpattu',
    name: 'Chengalpattu',
    capital: 'Chengalpattu',
    lat: 12.6841,
    lng: 79.9836,
    elevationMsl: 36,
    riskLevel: 'MODERATE',
    riskScore: 73,
    rainfall24h: 98,
    soilMoisture: 69.4,
    temperatureC: 31.8,
    humidity: 80,
    faultSlipRate: 0.9,
    hazardDescription: 'Paladhu River basin and Maduranthakam tank lake surplus floodway discharge monitoring.',
    revenueDivisions: [
      { name: 'Chengalpattu', taluks: ['Chengalpattu', 'Tirukalukundram', 'Thiruporur'] },
      { name: 'Maduranthakam', taluks: ['Maduranthakam', 'Cheyyur'] },
      { name: 'Tambaram', taluks: ['Tambaram', 'Pallavaram', 'Vandalur'] },
    ],
  },
  {
    id: 'dist-tiruvallur',
    name: 'Tiruvallur',
    capital: 'Tiruvallur',
    lat: 13.1432,
    lng: 79.9079,
    elevationMsl: 38,
    riskLevel: 'HIGH',
    riskScore: 78,
    rainfall24h: 122,
    soilMoisture: 76.0,
    temperatureC: 31.2,
    humidity: 82,
    faultSlipRate: 1.0,
    hazardDescription: 'Poondi & Chembarambakkam reservoir discharge flood corridors and Ennore creek coastal surge.',
    revenueDivisions: [
      { name: 'Tiruvallur', taluks: ['Tiruvallur', 'Poonamallee', 'Avadi'] },
      { name: 'Ponneri', taluks: ['Ponneri', 'Gummidipoondi', 'Uthukkottai'] },
      { name: 'Tiruttani', taluks: ['Tiruttani', 'Pallipattu', 'RK Pet'] },
    ],
  },
  {
    id: 'dist-kanchipuram',
    name: 'Kanchipuram',
    capital: 'Kanchipuram',
    lat: 12.8342,
    lng: 79.7036,
    elevationMsl: 83,
    riskLevel: 'MODERATE',
    riskScore: 67,
    rainfall24h: 84,
    soilMoisture: 66.8,
    temperatureC: 32.0,
    humidity: 77,
    faultSlipRate: 0.8,
    hazardDescription: 'Vegavathi river overflow corridors and industrial zone stormwater accumulation monitoring.',
    revenueDivisions: [
      { name: 'Kanchipuram', taluks: ['Kanchipuram', 'Walajabad', 'Uthiramerur'] },
      { name: 'Sriperumbudur', taluks: ['Sriperumbudur', 'Kundrathur'] },
    ],
  },
  {
    id: 'dist-vellore',
    name: 'Vellore',
    capital: 'Vellore',
    lat: 12.9165,
    lng: 79.1325,
    elevationMsl: 216,
    riskLevel: 'MODERATE',
    riskScore: 66,
    rainfall24h: 72,
    soilMoisture: 64.2,
    temperatureC: 33.1,
    humidity: 71,
    faultSlipRate: 1.4,
    hazardDescription: 'Palar riverbed aquifer fluctuation and Jawadhu hill pass boulder stability.',
    revenueDivisions: [
      { name: 'Vellore', taluks: ['Vellore', 'Katpadi', 'Anaicut'] },
      { name: 'Gudiyatham', taluks: ['Gudiyatham', 'Pernambut', 'K.V. Kuppam'] },
    ],
  },
  {
    id: 'dist-ranipet',
    name: 'Ranipet',
    capital: 'Ranipet',
    lat: 12.9272,
    lng: 79.333,
    elevationMsl: 160,
    riskLevel: 'MODERATE',
    riskScore: 63,
    rainfall24h: 68,
    soilMoisture: 62.0,
    temperatureC: 32.8,
    humidity: 73,
    faultSlipRate: 0.9,
    hazardDescription: 'Palar low-lying bunds and Arakkonam rail corridor drainage synchronization.',
    revenueDivisions: [
      { name: 'Ranipet', taluks: ['Walajah', 'Arcot', 'Kalavai'] },
      { name: 'Arakkonam', taluks: ['Arakkonam', 'Nemili', 'Sholinghur'] },
    ],
  },
  {
    id: 'dist-tirupathur',
    name: 'Tirupathur',
    capital: 'Tirupathur',
    lat: 12.4958,
    lng: 78.5736,
    elevationMsl: 388,
    riskLevel: 'MODERATE',
    riskScore: 65,
    rainfall24h: 70,
    soilMoisture: 63.5,
    temperatureC: 31.5,
    humidity: 75,
    faultSlipRate: 1.6,
    hazardDescription: 'Yelagiri Hills hairpin roads soil movement and Vaniyambadi flood control.',
    revenueDivisions: [
      { name: 'Tirupathur', taluks: ['Tirupathur', 'Natrampalli'] },
      { name: 'Vaniyambadi', taluks: ['Vaniyambadi', 'Ambur'] },
    ],
  },
  {
    id: 'dist-tiruvannamalai',
    name: 'Tiruvannamalai',
    capital: 'Tiruvannamalai',
    lat: 12.2253,
    lng: 79.0747,
    elevationMsl: 171,
    riskLevel: 'MODERATE',
    riskScore: 69,
    rainfall24h: 88,
    soilMoisture: 67.4,
    temperatureC: 32.2,
    humidity: 76,
    faultSlipRate: 1.8,
    hazardDescription: 'Annamalai Hill circumambulation pathway drainage and Jawadhu tribal valley isolation alerts.',
    revenueDivisions: [
      { name: 'Tiruvannamalai', taluks: ['Tiruvannamalai', 'Kilpennathur', 'Chengam', 'Thandarampattu', 'Kalasapakkam'] },
      { name: 'Cheyyar', taluks: ['Cheyyar', 'Vandavasi', 'Vembakkam', 'Chetpet', 'Arani', 'Polur', 'Jamunamarathur'] },
    ],
  },
  {
    id: 'dist-dharmapuri',
    name: 'Dharmapuri',
    capital: 'Dharmapuri',
    lat: 12.1211,
    lng: 78.1582,
    elevationMsl: 468,
    riskLevel: 'MODERATE',
    riskScore: 71,
    rainfall24h: 92,
    soilMoisture: 68.3,
    temperatureC: 30.8,
    humidity: 77,
    faultSlipRate: 2.2,
    hazardDescription: 'Hogenakkal Kaveri river torrent gorge discharge and Pennagaram forest watershed surges.',
    revenueDivisions: [
      { name: 'Dharmapuri', taluks: ['Dharmapuri', 'Palacode', 'Pennagaram', 'Karimangalam', 'Nallampalli'] },
      { name: 'Harur', taluks: ['Harur', 'Pappireddipatti'] },
    ],
  },
  {
    id: 'dist-krishnagiri',
    name: 'Krishnagiri',
    capital: 'Krishnagiri',
    lat: 12.5186,
    lng: 78.2137,
    elevationMsl: 492,
    riskLevel: 'MODERATE',
    riskScore: 70,
    rainfall24h: 85,
    soilMoisture: 66.5,
    temperatureC: 29.5,
    humidity: 75,
    faultSlipRate: 1.7,
    hazardDescription: 'KRP Reservoir spillway surges and Denkanikottai-Anchetti hill forest flash runoffs.',
    revenueDivisions: [
      { name: 'Krishnagiri', taluks: ['Krishnagiri', 'Pochampalli', 'Uthangarai', 'Bargur'] },
      { name: 'Hosur', taluks: ['Hosur', 'Denkanikottai', 'Shoolagiri', 'Anchetti'] },
    ],
  },
  {
    id: 'dist-erode',
    name: 'Erode',
    capital: 'Erode',
    lat: 11.341,
    lng: 77.7172,
    elevationMsl: 183,
    riskLevel: 'MODERATE',
    riskScore: 72,
    rainfall24h: 94,
    soilMoisture: 69.8,
    temperatureC: 31.0,
    humidity: 78,
    faultSlipRate: 1.5,
    hazardDescription: 'Bhavani-Kaveri confluence flood discharge and Sathyamangalam ghat elephant corridor alerts.',
    revenueDivisions: [
      { name: 'Erode', taluks: ['Erode', 'Perundurai', 'Modakkurichi', 'Kodumudi'] },
      { name: 'Gobichettipalayam', taluks: ['Gobichettipalayam', 'Sathyamangalam', 'Bhavani', 'Anthiyur', 'Thalavadi'] },
    ],
  },
  {
    id: 'dist-tiruppur',
    name: 'Tiruppur',
    capital: 'Tiruppur',
    lat: 11.1085,
    lng: 77.3411,
    elevationMsl: 295,
    riskLevel: 'MODERATE',
    riskScore: 66,
    rainfall24h: 68,
    soilMoisture: 63.4,
    temperatureC: 30.5,
    humidity: 74,
    faultSlipRate: 1.1,
    hazardDescription: 'Noyyal river overflow alerts and Amaravathi dam catchment flood routing.',
    revenueDivisions: [
      { name: 'Tiruppur', taluks: ['Tiruppur North', 'Tiruppur South', 'Avinashi', 'Palladam'] },
      { name: 'Dharapuram', taluks: ['Dharapuram', 'Kangeyam', 'Uthukuli', 'Udumalaipettai', 'Madathukulam'] },
    ],
  },
  {
    id: 'dist-namakkal',
    name: 'Namakkal',
    capital: 'Namakkal',
    lat: 11.2189,
    lng: 78.1674,
    elevationMsl: 218,
    riskLevel: 'HIGH',
    riskScore: 78,
    rainfall24h: 112,
    soilMoisture: 74.0,
    temperatureC: 30.2,
    humidity: 80,
    faultSlipRate: 3.1,
    hazardDescription: 'Kolli Hills 70-hairpin bend ghat landslide danger and Kaveri river bund alerts.',
    revenueDivisions: [
      { name: 'Namakkal', taluks: ['Namakkal', 'Rasipuram', 'Kolli Hills', 'Sendamangalam', 'Mohanur'] },
      { name: 'Tiruchengode', taluks: ['Tiruchengode', 'Paramathi Velur', 'Kumarapalayam'] },
    ],
  },
  {
    id: 'dist-karur',
    name: 'Karur',
    capital: 'Karur',
    lat: 10.9601,
    lng: 78.0766,
    elevationMsl: 122,
    riskLevel: 'MODERATE',
    riskScore: 64,
    rainfall24h: 62,
    soilMoisture: 61.2,
    temperatureC: 33.4,
    humidity: 71,
    faultSlipRate: 0.7,
    hazardDescription: 'Amaravathi & Kaveri river confluence flood volume and Mayanur barrage surveillance.',
    revenueDivisions: [
      { name: 'Karur', taluks: ['Karur', 'Aravakurichi', 'Manmangalam', 'Pugalur'] },
      { name: 'Kulithalai', taluks: ['Kulithalai', 'Krishnarayapuram', 'Kadavur'] },
    ],
  },
  {
    id: 'dist-tiruchirappalli',
    name: 'Tiruchirappalli',
    capital: 'Tiruchirappalli',
    lat: 10.7905,
    lng: 78.7047,
    elevationMsl: 88,
    riskLevel: 'MODERATE',
    riskScore: 72,
    rainfall24h: 90,
    soilMoisture: 69.0,
    temperatureC: 32.5,
    humidity: 78,
    faultSlipRate: 0.9,
    hazardDescription: 'Grand Anicut & Mukkombu regulator Kaveri-Kollidam bifurcation flood spillway alerts.',
    revenueDivisions: [
      { name: 'Tiruchirappalli', taluks: ['Tiruchirappalli West', 'Tiruchirappalli East', 'Srirangam', 'Manapparai', 'Marungapuri'] },
      { name: 'Lalgudi', taluks: ['Lalgudi', 'Manachanallur', 'Tiruverumbur'] },
      { name: 'Musiri', taluks: ['Musiri', 'Thottiyam', 'Thuraiyur'] },
    ],
  },
  {
    id: 'dist-perambalur',
    name: 'Perambalur',
    capital: 'Perambalur',
    lat: 11.2342,
    lng: 78.8816,
    elevationMsl: 143,
    riskLevel: 'LOW',
    riskScore: 54,
    rainfall24h: 48,
    soilMoisture: 55.4,
    temperatureC: 33.8,
    humidity: 68,
    faultSlipRate: 0.5,
    hazardDescription: 'Vellar river basin tributary flash runoff and Pachaimalai hill foothills monitoring.',
    revenueDivisions: [
      { name: 'Perambalur', taluks: ['Perambalur', 'Kunnam', 'Veppanthattai', 'Alathur'] },
    ],
  },
  {
    id: 'dist-ariyalur',
    name: 'Ariyalur',
    capital: 'Ariyalur',
    lat: 11.1401,
    lng: 79.0786,
    elevationMsl: 76,
    riskLevel: 'LOW',
    riskScore: 56,
    rainfall24h: 52,
    soilMoisture: 57.0,
    temperatureC: 33.5,
    humidity: 70,
    faultSlipRate: 0.6,
    hazardDescription: 'Marudaiyaru river basin overflow and limestone quarry deep subsidence safeguards.',
    revenueDivisions: [
      { name: 'Ariyalur', taluks: ['Ariyalur', 'Sendurai'] },
      { name: 'Udayarpalayam', taluks: ['Udayarpalayam', 'Andimadam'] },
    ],
  },
  {
    id: 'dist-kallakurichi',
    name: 'Kallakurichi',
    capital: 'Kallakurichi',
    lat: 11.7384,
    lng: 78.9639,
    elevationMsl: 162,
    riskLevel: 'MODERATE',
    riskScore: 71,
    rainfall24h: 89,
    soilMoisture: 68.0,
    temperatureC: 31.9,
    humidity: 76,
    faultSlipRate: 2.1,
    hazardDescription: 'Kalvarayan Hills tribal ghat road landslip watch and Gomukhi dam surplus alerts.',
    revenueDivisions: [
      { name: 'Kallakurichi', taluks: ['Kallakurichi', 'Chinnaselam', 'Kalvarayan Hills'] },
      { name: 'Tirukkoyilur', taluks: ['Sankarapuram', 'Tirukkoyilur', 'Ulundurpet'] },
    ],
  },
  {
    id: 'dist-viluppuram',
    name: 'Viluppuram',
    capital: 'Viluppuram',
    lat: 11.9401,
    lng: 79.4861,
    elevationMsl: 45,
    riskLevel: 'HIGH',
    riskScore: 77,
    rainfall24h: 115,
    soilMoisture: 73.5,
    temperatureC: 32.0,
    humidity: 82,
    faultSlipRate: 1.0,
    hazardDescription: 'Pennaiyar River flood inundation and Marakkanam salt pan coastal surge susceptibility.',
    revenueDivisions: [
      { name: 'Viluppuram', taluks: ['Viluppuram', 'Vikravandi', 'Vanur', 'Kandachipuram', 'Thiruvennainallur'] },
      { name: 'Tindivanam', taluks: ['Tindivanam', 'Gingee', 'Marakkanam'] },
    ],
  },
  {
    id: 'dist-thanjavur',
    name: 'Thanjavur',
    capital: 'Thanjavur',
    lat: 10.787,
    lng: 79.1378,
    elevationMsl: 57,
    riskLevel: 'HIGH',
    riskScore: 79,
    rainfall24h: 125,
    soilMoisture: 78.2,
    temperatureC: 31.2,
    humidity: 85,
    faultSlipRate: 0.8,
    hazardDescription: 'Cauvery Delta flood mesh, Vennar regulator breaches, and coastal cyclone buffer alerts.',
    revenueDivisions: [
      { name: 'Thanjavur', taluks: ['Thanjavur', 'Thiruvaiyaru', 'Budalur'] },
      { name: 'Kumbakonam', taluks: ['Kumbakonam', 'Papanasam', 'Thiruvidaimarudur'] },
      { name: 'Pattukkottai', taluks: ['Pattukkottai', 'Peravurani', 'Orathanadu'] },
    ],
  },
  {
    id: 'dist-tiruvarur',
    name: 'Tiruvarur',
    capital: 'Tiruvarur',
    lat: 10.7725,
    lng: 79.6365,
    elevationMsl: 10,
    riskLevel: 'HIGH',
    riskScore: 82,
    rainfall24h: 138,
    soilMoisture: 82.5,
    temperatureC: 30.5,
    humidity: 89,
    faultSlipRate: 0.7,
    hazardDescription: 'Delta tail-end drainage congestion, Muthupet mangrove tidal backwaters & cyclone surges.',
    revenueDivisions: [
      { name: 'Tiruvarur', taluks: ['Tiruvarur', 'Nannilam', 'Kudavasal', 'Koothanallur'] },
      { name: 'Mannargudi', taluks: ['Mannargudi', 'Valangaiman', 'Needamangalam', 'Thiruthuraipoondi'] },
    ],
  },
  {
    id: 'dist-nagapattinam',
    name: 'Nagapattinam',
    capital: 'Nagapattinam',
    lat: 10.7656,
    lng: 79.8424,
    elevationMsl: 4,
    riskLevel: 'CRITICAL',
    riskScore: 89,
    rainfall24h: 165,
    soilMoisture: 86.4,
    temperatureC: 30.0,
    humidity: 94,
    faultSlipRate: 1.1,
    hazardDescription: 'Extreme Bay of Bengal cyclone landfall hazard, tsunami corridor and Vedaranyam swamp inundation.',
    revenueDivisions: [
      { name: 'Nagapattinam', taluks: ['Nagapattinam', 'Kilvelur', 'Thirukkuvalai'] },
      { name: 'Vedaranyam', taluks: ['Vedaranyam'] },
    ],
  },
  {
    id: 'dist-mayiladuthurai',
    name: 'Mayiladuthurai',
    capital: 'Mayiladuthurai',
    lat: 11.1018,
    lng: 79.6522,
    elevationMsl: 19,
    riskLevel: 'HIGH',
    riskScore: 80,
    rainfall24h: 130,
    soilMoisture: 80.0,
    temperatureC: 30.8,
    humidity: 88,
    faultSlipRate: 0.9,
    hazardDescription: 'Kollidam & Kaveri estuary storm tidal surges and Sirkazhi coastal inundation watch.',
    revenueDivisions: [
      { name: 'Mayiladuthurai', taluks: ['Mayiladuthurai', 'Kuthalam'] },
      { name: 'Sirkazhi', taluks: ['Sirkazhi', 'Tharangambadi'] },
    ],
  },
  {
    id: 'dist-pudukkottai',
    name: 'Pudukkottai',
    capital: 'Pudukkottai',
    lat: 10.3833,
    lng: 78.8001,
    elevationMsl: 100,
    riskLevel: 'MODERATE',
    riskScore: 68,
    rainfall24h: 75,
    soilMoisture: 65.0,
    temperatureC: 32.6,
    humidity: 76,
    faultSlipRate: 0.6,
    hazardDescription: 'Vellar river delta drainage and Palk Strait shallow coast cyclone gust vulnerabilities.',
    revenueDivisions: [
      { name: 'Pudukkottai', taluks: ['Pudukkottai', 'Alangudi', 'Gandarvakottai', 'Thirumayam'] },
      { name: 'Aranthangi', taluks: ['Aranthangi', 'Avudaiyarkoil', 'Manamelkudi', 'Karambakkudi'] },
      { name: 'Iluppur', taluks: ['Iluppur', 'Kulathur', 'Ponnamaravathi', 'Viralimalai'] },
    ],
  },
  {
    id: 'dist-madurai',
    name: 'Madurai',
    capital: 'Madurai',
    lat: 9.9252,
    lng: 78.1198,
    elevationMsl: 136,
    riskLevel: 'MODERATE',
    riskScore: 70,
    rainfall24h: 82,
    soilMoisture: 67.5,
    temperatureC: 33.0,
    humidity: 74,
    faultSlipRate: 1.2,
    hazardDescription: 'Vaigai river urban basin surge monitoring and Sirumalai foothills drainage alerts.',
    revenueDivisions: [
      { name: 'Madurai', taluks: ['Madurai North', 'Madurai South', 'Madurai East', 'Madurai West'] },
      { name: 'Melur', taluks: ['Melur', 'Vadipatti', 'Thiruparankundram'] },
      { name: 'Usilampatti', taluks: ['Usilampatti', 'Thirumangalam', 'Peraiyur', 'Kalligudi'] },
    ],
  },
  {
    id: 'dist-sivaganga',
    name: 'Sivaganga',
    capital: 'Sivaganga',
    lat: 9.8433,
    lng: 78.4809,
    elevationMsl: 102,
    riskLevel: 'LOW',
    riskScore: 58,
    rainfall24h: 56,
    soilMoisture: 58.0,
    temperatureC: 33.2,
    humidity: 72,
    faultSlipRate: 0.5,
    hazardDescription: 'Vaigai downstream canal networks and dry tank bund stability inspections.',
    revenueDivisions: [
      { name: 'Sivaganga', taluks: ['Sivaganga', 'Manamadurai', 'Ilayangudi', 'Kalaiyarkoil', 'Thiruppuvanam'] },
      { name: 'Devakottai', taluks: ['Devakottai', 'Karaikudi', 'Tirupathur', 'Singampunari'] },
    ],
  },
  {
    id: 'dist-virudhunagar',
    name: 'Virudhunagar',
    capital: 'Virudhunagar',
    lat: 9.568,
    lng: 77.9624,
    elevationMsl: 117,
    riskLevel: 'MODERATE',
    riskScore: 66,
    rainfall24h: 70,
    soilMoisture: 64.0,
    temperatureC: 33.5,
    humidity: 71,
    faultSlipRate: 1.9,
    hazardDescription: 'Srivilliputhur Western Ghats Grizzled Squirrel sanctuary flash floods and Watrap hill runoff.',
    revenueDivisions: [
      { name: 'Virudhunagar', taluks: ['Virudhunagar', 'Kariapatti', 'Tiruchuli'] },
      { name: 'Sivakasi', taluks: ['Sivakasi', 'Rajapalayam', 'Srivilliputhur', 'Watrap'] },
      { name: 'Aruppukkottai', taluks: ['Aruppukkottai', 'Sattur', 'Vembakottai'] },
    ],
  },
  {
    id: 'dist-ramanathapuram',
    name: 'Ramanathapuram',
    capital: 'Ramanathapuram',
    lat: 9.3639,
    lng: 78.8395,
    elevationMsl: 8,
    riskLevel: 'HIGH',
    riskScore: 83,
    rainfall24h: 145,
    soilMoisture: 82.0,
    temperatureC: 31.0,
    humidity: 91,
    faultSlipRate: 1.0,
    hazardDescription: 'Rameswaram Island & Pamban sea bridge cyclone gale warnings and shallow coastal surge alert.',
    revenueDivisions: [
      { name: 'Ramanathapuram', taluks: ['Ramanathapuram', 'Rameswaram', 'Tiruvadanai', 'Kilakarai', 'Rajasingamangalam'] },
      { name: 'Paramakudi', taluks: ['Paramakudi', 'Mudukulathur', 'Kamuthi', 'Kadaladi'] },
    ],
  },
  {
    id: 'dist-thoothukudi',
    name: 'Thoothukudi',
    capital: 'Thoothukudi',
    lat: 8.7642,
    lng: 78.1348,
    elevationMsl: 5,
    riskLevel: 'HIGH',
    riskScore: 81,
    rainfall24h: 135,
    soilMoisture: 79.0,
    temperatureC: 31.8,
    humidity: 86,
    faultSlipRate: 1.0,
    hazardDescription: 'Gulf of Mannar coastal inundation, Srivaikuntam dam surplus and industrial port stormwater locks.',
    revenueDivisions: [
      { name: 'Thoothukudi', taluks: ['Thoothukudi', 'Srivaikuntam', 'Eral'] },
      { name: 'Kovilpatti', taluks: ['Kovilpatti', 'Ottapidaram', 'Ettayapuram', 'Vilathikulam', 'Kayathar'] },
      { name: 'Tiruchendur', taluks: ['Tiruchendur', 'Sathankulam'] },
    ],
  },
];

// Generate Flat List of all 310 Taluks as LocationEntities
export function generateAllTaluks(): LocationEntity[] {
  const result: LocationEntity[] = [];

  TAMIL_NADU_DISTRICTS.forEach((district) => {
    district.revenueDivisions.forEach((division) => {
      division.taluks.forEach((talukName, talukIndex) => {
        // Compute realistic slight coordinate offsets for each taluk around district center
        const angle = (talukIndex / Math.max(division.taluks.length, 1)) * 2 * Math.PI;
        const latOffset = Math.sin(angle) * 0.08;
        const lngOffset = Math.cos(angle) * 0.08;

        const isHilly = district.name === 'The Nilgiris' || district.name === 'Dindigul' || district.name === 'Theni';
        const isCoastal = district.name === 'Chennai' || district.name === 'Nagapattinam' || district.name === 'Cuddalore' || district.name === 'Kanyakumari' || district.name === 'Ramanathapuram';

        const talukId = `loc-tn-${district.name.toLowerCase().replace(/\s+/g, '-')}-${talukName.toLowerCase().replace(/\s+/g, '-')}`;

        result.push({
          id: talukId,
          name: `${talukName} Taluk, ${district.name}`,
          type: 'taluk',
          district: district.name,
          taluk: talukName,
          state: 'Tamil Nadu',
          lat: Number((district.lat + latOffset).toFixed(4)),
          lng: Number((district.lng + lngOffset).toFixed(4)),
          elevationMsl: isHilly ? district.elevationMsl - talukIndex * 80 : district.elevationMsl + talukIndex * 5,
          riskLevel: district.riskLevel,
          riskScore: Math.min(Math.max(district.riskScore + (talukIndex % 3) * 2 - 2, 45), 98),
          rainfall24h: Math.max(0, Number(((district.rainfall24h * 0.03) + (talukIndex % 3) * 0.2).toFixed(1))),
          soilMoisture: Number((district.soilMoisture + (talukIndex % 2) * 1.5 - 1).toFixed(1)),
          temperatureC: district.temperatureC,
          humidity: district.humidity,
          faultSlipRate: district.faultSlipRate,
          hazardDescription: `${talukName} Taluk in ${district.name} under ${division.name} Revenue Division. Capital: ${district.capital}. ${
            isHilly
              ? 'Western Ghats slope shear and landslide monitoring active.'
              : isCoastal
              ? 'Coastal cyclonic surge and storm drainage corridor active.'
              : 'River basin flood monitoring and civil defense grid active.'
          }`,
        });
      });
    });
  });

  return result;
}

export const LOCATIONS_DATABASE: LocationEntity[] = generateAllTaluks();

// Default Location: Coonoor Taluk in The Nilgiris (Iconic high-risk landslide monitoring sector of Tamil Nadu)
export const DEFAULT_LOCATION: LocationEntity = LOCATIONS_DATABASE.find(
  (l) => l.taluk === 'Coonoor' && l.district === 'The Nilgiris'
) || LOCATIONS_DATABASE[0];

// Helper to find the nearest matching Taluk and District for given GPS coordinates
// STRICTLY formats name as "[Taluk Name] Taluk, [District]" - NO "N and E" coordinates in name!
export function findNearestTaluk(latitude: number, longitude: number): LocationEntity {
  let closest = DEFAULT_LOCATION;
  let minDistance = Infinity;

  for (const loc of LOCATIONS_DATABASE) {
    const dist = Math.hypot(loc.lat - latitude, loc.lng - longitude);
    if (dist < minDistance) {
      minDistance = dist;
      closest = loc;
    }
  }

  // Return a clean entity matching the exact taluk and district with live coordinates
  return {
    ...closest,
    id: `loc-gps-taluk-${closest.taluk.toLowerCase().replace(/\s+/g, '-')}`,
    name: `${closest.taluk} Taluk, ${closest.district}`,
    type: 'gps',
    lat: latitude,
    lng: longitude,
    hazardDescription: `Live GPS calibrated to nearest sector: ${closest.taluk} Taluk (${closest.district} District). Real-time ground sensor uplink synchronized.`,
  };
}

// Return Stack-Wise Hierarchy: Districts (38) -> Revenue Divisions (87) -> Taluks (310)
export function getStackWiseHierarchy(): StackDistrict[] {
  return TAMIL_NADU_DISTRICTS.map((dist) => {
    let talukCount = 0;
    const taluksList: StackTaluk[] = [];

    dist.revenueDivisions.forEach((division) => {
      division.taluks.forEach((tName) => {
        talukCount++;
        const matchingEntities = LOCATIONS_DATABASE.filter(
          (loc) => loc.district === dist.name && loc.taluk === tName
        );

        taluksList.push({
          name: tName,
          revenueDivision: division.name,
          villages: matchingEntities,
        });
      });
    });

    const distEntity = LOCATIONS_DATABASE.find((l) => l.district === dist.name) || {
      id: `dist-loc-${dist.id}`,
      name: `${dist.name} District (Capital: ${dist.capital})`,
      type: 'district',
      district: dist.name,
      taluk: `${dist.capital} (HQ)`,
      state: 'Tamil Nadu',
      lat: dist.lat,
      lng: dist.lng,
      elevationMsl: dist.elevationMsl,
      riskLevel: dist.riskLevel,
      riskScore: dist.riskScore,
      rainfall24h: Number((dist.rainfall24h * 0.03).toFixed(1)),
      soilMoisture: dist.soilMoisture,
      temperatureC: dist.temperatureC,
      humidity: dist.humidity,
      faultSlipRate: dist.faultSlipRate,
      hazardDescription: dist.hazardDescription,
    } as LocationEntity;

    return {
      name: dist.name,
      capital: dist.capital,
      state: 'Tamil Nadu',
      revenueDivisionsCount: dist.revenueDivisions.length,
      taluksCount: talukCount,
      taluks: taluksList,
      districtEntity: distEntity,
    };
  });
}

// Search utility
export function searchLocations(query: string): LocationEntity[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return [];

  return LOCATIONS_DATABASE.filter(
    (loc) =>
      loc.name.toLowerCase().includes(clean) ||
      loc.taluk.toLowerCase().includes(clean) ||
      loc.district.toLowerCase().includes(clean)
  ).slice(0, 25);
}
