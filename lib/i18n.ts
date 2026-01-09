export type Language = 'en' | 'de';

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
  pickup: string;
  delivery: string;
  dineIn: string;
  googleMapNotLoadedError: string;
  typeMoreDetailsError: string;
  addMoreAddressDetails: string;
  deliveryAddress: string;
  loadingMaps: string;
  pleaseWait: string;
  startTypeAndChooseAddress: string;
  searching: string;
  noSuggestionsFoundAddPostalCode: string;
  cancel: string;
  couldNotFetchAddressDetails: string;
  addressSearchPlaceholder: string;
  houseStreetNumber: string;
  streetName: string;
  postalCode: string;
  pleaseSelectCompleteAddress: string;
  deliverTo: string;
  deliveryCharges: string;
  weAreNotAvailableInYourArea: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    openUntil: 'Open until',
    location: 'Route',
    delivery: 'Delivery',
    pickup: 'Pickup',
    dineIn: 'Dine In',
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

    // specialInstructions: 'Special Instructions (Optional)',
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

    googleMapNotLoadedError: 'Google Maps is not loaded. Please try again.',
    typeMoreDetailsError: 'Type more details (street, number, postal code) for best results.',
    addMoreAddressDetails: 'Street + house number + postal code',
    deliveryAddress: 'Delivery address',
    loadingMaps: 'Loading Maps…',
    pleaseWait: 'Please wait',
    startTypeAndChooseAddress: 'Start typing and choose your address from the list.',
    searching: 'Searching…',
    noSuggestionsFoundAddPostalCode: 'No suggestions found. Try adding a postal code.',
    cancel: 'Cancel',
    couldNotFetchAddressDetails: 'Could not fetch address details. Please try another suggestion.',
    addressSearchPlaceholder: 'Street + house number + postal code',
    pleaseSelectCompleteAddress: 'Please select a complete address that includes:',
    houseStreetNumber: 'House / street number',
    streetName: 'Street name',
    postalCode: 'Postal code',
    deliverTo: 'Deliver to',
    deliveryCharges: 'Delivery Charges',
    weAreNotAvailableInYourArea: 'We are not available in your area.',
    specialInstructions: 'Special Instructions / Notes (Optional)',
  },
  de: {
    openUntil: 'Geöffnet bis',
    closed: 'Geschlossen',
    location: 'Standort',
    delivery: 'Lieferung',
    pickup: 'Abholung',
    dineIn: 'Vor Ort essen',
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

    // specialInstructions: 'Spezielle Anweisungen (Optional)',
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
    googleMapNotLoadedError: 'Google Maps ist nicht geladen. Bitte versuchen Sie es erneut.',
    typeMoreDetailsError: 'Geben Sie mehr Details ein (Straße, Hausnummer, PLZ) für bessere Ergebnisse.',
    addMoreAddressDetails: 'Straße + Hausnummer + PLZ',
    deliveryAddress: 'Lieferadresse',
    loadingMaps: 'Karten werden geladen…',
    pleaseWait: 'Bitte warten',
    startTypeAndChooseAddress: 'Beginnen Sie zu tippen und wählen Sie Ihre Adresse aus der Liste.',
    searching: 'Suche…',
    noSuggestionsFoundAddPostalCode: 'Keine Vorschläge gefunden. Versuchen Sie, eine PLZ hinzuzufügen.',
    cancel: 'Abbrechen',
    couldNotFetchAddressDetails: 'Adressdetails konnten nicht geladen werden. Bitte wählen Sie einen anderen Vorschlag.',
    addressSearchPlaceholder: 'Straße + Hausnummer + PLZ',
    pleaseSelectCompleteAddress: 'Bitte wählen Sie eine vollständige Adresse, die Folgendes enthält:',
    houseStreetNumber: 'Haus- / Straßennummer',
    streetName: 'Straßenname',
    postalCode: 'Postleitzahl',
    deliverTo: 'Liefern an',
    deliveryCharges: 'Lieferkosten',
    weAreNotAvailableInYourArea: 'Wir sind in Ihrer Gegend nicht verfügbar.',

    specialInstructions: 'Spezielle Anweisungen / Notizen (Optional)',
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
