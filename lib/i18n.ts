export type Language = 'en' | 'de' | 'nl' | 'fr';

export interface Translations {
  openUntil: string;
  location: string;
  
  popular: string;
  truffleSeason: string;
  lunchDeals: string;
  fentimans: string;
  burgers: string;
  sides: string;
  sandwiches: string;
  sauces: string;
  wine: string;
  beer: string;
  softDrinks: string;
  milkshakes: string;
  kids: string;
  
  yourCart: string;
  checkout: string;
  closed: string;
  total: string;
  totalIncludingVAT: string;
  proceedToCheckout: string;
  placeOrder: string;
  placingOrder: string;
  paymentMethod: string;
  enterDetails: string;
  order: string;
  close: string;
  next: string;
  back: string;
  pay: string;
  cash: string;
  posCardPayment: string;
  
  specialInstructions: string;
  addAnySpecialRequests: string;
  addToCart: string;
  
  yourName: string;
  name: string;
  email: string;
  phoneNumber: string;
  pickupTime: string;
  asapTime: string;
  tableNumber: string;
  yourData: string;
  checkTableNumber: string;
  nameRequired: string;
  emailRequired: string;
  invalidEmail: string;
  phoneRequired: string;
  invalidPhone: string;
  tableRequired: string;
  
  notAvailable: string;
  chooseYourSize: string;
  addExtras: string;
  regular: string;
  large: string;
  extraBacon: string;
  extraCheese: string;
  extraPickles: string;
}

export const translations: Record<Language, Translations> = {
  nl: {
    openUntil: 'Open tot',
    location: 'Locatie',
    
    popular: 'Populair',
    truffleSeason: 'Truffelseizoen',
    lunchDeals: 'Lunchdeals',
    fentimans: 'Fentimans',
    burgers: 'Burgers',
    sides: 'Bijgerechten',
    sandwiches: 'Broodjes',
    sauces: 'Sauzen',
    wine: 'Wijn',
    beer: 'Bier',
    softDrinks: 'Frisdranken',
    milkshakes: 'Milkshakes',
    kids: 'Kids',
    
    yourCart: 'Jouw Winkelwagen',
    checkout: 'Afrekenen',
    closed: 'Gesloten',
    total: 'Totaal',
    totalIncludingVAT: 'Totaal (inclusief BTW)',
    proceedToCheckout: 'Naar Afrekenen',
    placeOrder: 'Bestelling Plaatsen',
    placingOrder: 'Bestelling Plaatsen...',
    paymentMethod: 'Betaalmethode',
    enterDetails: 'Vul je gegevens in',
    order: 'Bestelling',
    close: 'Sluiten',
    next: 'Volgende',
    back: 'Terug',
    pay: 'Betalen',
    cash: 'Contant',
    posCardPayment: 'POS Kaartbetaling',
    
    specialInstructions: 'Speciale Instructies (Optioneel)',
    addAnySpecialRequests: 'Voeg speciale verzoeken toe...',
    addToCart: 'Aan Winkelwagen Toevoegen',
    
    yourName: 'Jouw Naam',
    name: 'Naam',
    email: 'E-mail',
    phoneNumber: 'Telefoonnummer',
    pickupTime: 'Ophaaltijd',
    asapTime: 'Zo snel mogelijk',
    tableNumber: 'Tafelnummer',
    yourData: 'Jouw gegevens',
    checkTableNumber: 'Controleer het nummer op jouw tafel',
    nameRequired: 'Naam is verplicht',
    emailRequired: 'E-mail is verplicht',
    invalidEmail: 'Ongeldig e-mailadres',
    phoneRequired: 'Telefoonnummer is verplicht',
    invalidPhone: 'Ongeldig telefoonnummer',
    tableRequired: 'Tafelnummer is verplicht',
    
    notAvailable: 'Niet Beschikbaar',
    chooseYourSize: 'Kies je maat',
    addExtras: "Extra's toevoegen",
    regular: 'Normaal',
    large: 'Groot',
    extraBacon: 'Extra Spek',
    extraCheese: 'Extra Kaas',
    extraPickles: 'Extra Augurken',
  },
  en: {
    openUntil: 'Open until',
    location: 'Route',
    
    popular: 'Popular',
    truffleSeason: 'Truffle Season',
    lunchDeals: 'LunchDeals',
    fentimans: 'Fentimans',
    burgers: 'Burgers',
    sides: 'Sides',
    sandwiches: 'Sandwiches',
    sauces: 'Sauces',
    wine: 'Wine',
    beer: 'Beer',
    softDrinks: 'Soft Drinks',
    milkshakes: 'Milkshakes',
    kids: 'Kids',
    
    yourCart: 'Your Cart',
    checkout: 'Order',
    closed: 'Closed',
    total: 'Total',
    totalIncludingVAT: 'Total (Including VAT)',
    proceedToCheckout: 'Proceed to Checkout',
    placeOrder: 'Place Order',
    placingOrder: 'Placing Order...',
    paymentMethod: 'Payment Method',
    enterDetails: 'Enter your details',
    order: 'Order',
    close: 'Close',
    next: 'Next',
    back: 'Back',
    pay: 'Pay',
    cash: 'Cash',
    posCardPayment: 'POS Card payment',
    
    specialInstructions: 'Special Instructions (Optional)',
    addAnySpecialRequests: 'Add any special requests...',
    addToCart: 'Add to Cart',
    
    yourName: 'Your Name',
    name: 'Name',
    email: 'Email',
    phoneNumber: 'Phone number',
    pickupTime: 'Pickup time',
    asapTime: 'As soon as possible',
    tableNumber: 'Table Number',
    yourData: 'Your data',
    checkTableNumber: 'Check the number written on your table',
    nameRequired: 'Name is required',
    emailRequired: 'Email is required',
    invalidEmail: 'Invalid email address',
    phoneRequired: 'Phone number is required',
    invalidPhone: 'Invalid phone number',
    tableRequired: 'Table number is required',
    
    notAvailable: 'Not Available',
    chooseYourSize: 'Choose your size',
    addExtras: 'Add extras',
    regular: 'Regular',
    large: 'Large',
    extraBacon: 'Extra Bacon',
    extraCheese: 'Extra Cheese',
    extraPickles: 'Extra Pickles',
  },
  de: {
    openUntil: 'Geöffnet bis',
    location: 'Standort',
    
    popular: 'Beliebt',
    truffleSeason: 'Trüffelsaison',
    lunchDeals: 'Mittagsangebote',
    fentimans: 'Fentimans',
    burgers: 'Burger',
    sides: 'Beilagen',
    sandwiches: 'Sandwiches',
    sauces: 'Saucen',
    wine: 'Wein',
    beer: 'Bier',
    softDrinks: 'Erfrischungsgetränke',
    milkshakes: 'Milchshakes',
    kids: 'Kinder',
    
    yourCart: 'Ihr Warenkorb',
    checkout: 'Zur Kasse',
    closed: 'Geschlossen',
    total: 'Gesamt',
    totalIncludingVAT: 'Gesamt (inkl. MwSt.)',
    proceedToCheckout: 'Zur Kasse gehen',
    placeOrder: 'Bestellung aufgeben',
    placingOrder: 'Bestellung wird aufgegeben...',
    paymentMethod: 'Zahlungsmethode',
    enterDetails: 'Geben Sie Ihre Daten ein',
    order: 'Bestellung',
    close: 'Schließen',
    next: 'Weiter',
    back: 'Zurück',
    pay: 'Bezahlen',
    cash: 'Bargeld',
    posCardPayment: 'POS-Kartenzahlung',
    
    specialInstructions: 'Spezielle Anweisungen (Optional)',
    addAnySpecialRequests: 'Fügen Sie spezielle Wünsche hinzu...',
    addToCart: 'In den Warenkorb',
    
    yourName: 'Ihr Name',
    name: 'Name',
    email: 'E-Mail',
    phoneNumber: 'Telefonnummer',
    pickupTime: 'Abholzeit',
    asapTime: 'So schnell wie möglich',
    tableNumber: 'Tischnummer',
    yourData: 'Ihre Daten',
    checkTableNumber: 'Überprüfen Sie die Nummer auf Ihrem Tisch',
    nameRequired: 'Name ist erforderlich',
    emailRequired: 'E-Mail ist erforderlich',
    invalidEmail: 'Ungültige E-Mail-Adresse',
    phoneRequired: 'Telefonnummer ist erforderlich',
    invalidPhone: 'Ungültige Telefonnummer',
    tableRequired: 'Tischnummer ist erforderlich',
    
    notAvailable: 'Nicht verfügbar',
    chooseYourSize: 'Wählen Sie Ihre Größe',
    addExtras: 'Extras hinzufügen',
    regular: 'Normal',
    large: 'Groß',
    extraBacon: 'Extra Speck',
    extraCheese: 'Extra Käse',
    extraPickles: 'Extra Essiggurken',
  },
  fr: {
    openUntil: 'Ouvert jusqu\'à',
    location: 'Emplacement',
    
    popular: 'Populaire',
    truffleSeason: 'Saison des Truffes',
    lunchDeals: 'Offres Déjeuner',
    fentimans: 'Fentimans',
    burgers: 'Burgers',
    sides: 'Accompagnements',
    sandwiches: 'Sandwichs',
    sauces: 'Sauces',
    wine: 'Vin',
    beer: 'Bière',
    softDrinks: 'Boissons non alcoolisées',
    milkshakes: 'Milkshakes',
    kids: 'Enfants',
    
    yourCart: 'Votre Panier',
    checkout: 'Caisse',
    closed: 'Fermé',
    total: 'Total',
    totalIncludingVAT: 'Total (TVA incluse)',
    proceedToCheckout: 'Procéder au paiement',
    placeOrder: 'Passer la commande',
    placingOrder: 'Passage de la commande...',
    paymentMethod: 'Mode de paiement',
    enterDetails: 'Entrez vos coordonnées',
    order: 'Commande',
    close: 'Fermer',
    next: 'Suivant',
    back: 'Retour',
    pay: 'Payer',
    cash: 'Espèces',
    posCardPayment: 'Paiement par carte POS',
    
    specialInstructions: 'Instructions spéciales (Optionnel)',
    addAnySpecialRequests: 'Ajoutez vos demandes spéciales...',
    addToCart: 'Ajouter au panier',
    
    yourName: 'Votre Nom',
    name: 'Nom',
    email: 'E-mail',
    phoneNumber: 'Numéro de téléphone',
    pickupTime: 'Heure de retrait',
    asapTime: 'Dès que possible',
    tableNumber: 'Numéro de table',
    yourData: 'Vos données',
    checkTableNumber: 'Vérifiez le numéro sur votre table',
    nameRequired: 'Le nom est requis',
    emailRequired: 'L\'e-mail est requis',
    invalidEmail: 'Adresse e-mail invalide',
    phoneRequired: 'Le numéro de téléphone est requis',
    invalidPhone: 'Numéro de téléphone invalide',
    tableRequired: 'Le numéro de table est requis',
    
    notAvailable: 'Non disponible',
    chooseYourSize: 'Choisissez votre taille',
    addExtras: 'Ajouter des extras',
    regular: 'Normal',
    large: 'Grand',
    extraBacon: 'Extra Bacon',
    extraCheese: 'Extra Fromage',
    extraPickles: 'Extra Cornichons',
  },
};

export function getCategoryTranslation(categoryId: string, language: Language): string {
  const mapping: Record<string, keyof Translations> = {
    'popular': 'popular',
    'truffle-season': 'truffleSeason',
    'lunchdeals': 'lunchDeals',
    'fentimans': 'fentimans',
    'burgers': 'burgers',
    'sides': 'sides',
    'sandwiches': 'sandwiches',
    'sauces': 'sauces',
    'wine': 'wine',
    'beer': 'beer',
    'soft-drinks': 'softDrinks',
    'milkshakes': 'milkshakes',
    'kids': 'kids',
  };

  const key = mapping[categoryId];
  return key ? translations[language][key] : categoryId;
}
