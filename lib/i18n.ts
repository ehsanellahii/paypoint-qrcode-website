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
  minimumOrderAmountIs: string;
  requiredChooseAtleast: string;
  chooseUpTo: string;
  maxReached: string;
  add: string;
  selected: string;
  deliveryNotes: string;
  enterDeliveryNotes: string;
  deliveryTime: string;
  orderPlacedSuccessfully: string;
  orderId: string;
  redirectingIn: string;
  continue: string;
  termAndConditions: string;
  privacyPolicy: string;

  orders: string;
  items: string;
  itemsTotal: string;
  discount: string;
  tax: string;
  customer: string;
  address: string;
  vouchers: string;
  totalOrders: string;

  pleaseLogin: string;
  loginToSeeOrders: string;
  loading: string;
  somethingWentWrong: string;
  retry: string;
  noOrdersYet: string;
  yourOrdersWillAppearHere: string;
  notLoggedIn: string;

  sentToStore: string;
  inDelivery: string;
  isDelivered: string;
  isCancelled: string;
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
    posCardPayment: 'Card Payment (POS)',

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
    minimumOrderAmountIs: 'Minimum order amount is',
    requiredChooseAtleast: 'Required: Choose at least',
    chooseUpTo: 'Choose up to',
    maxReached: 'Max reached',
    add: 'Add',
    selected: 'selected',
    deliveryNotes: 'Delivery Notes',
    enterDeliveryNotes: 'Enter delivery notes...',
    deliveryTime: 'Delivery Time',

    orderPlacedSuccessfully: 'Order placed successfully 🎉',
    orderId: 'Order ID',
    redirectingIn: 'Redirecting in',
    continue: 'Continue now',
    termAndConditions: 'Terms and Conditions',
    privacyPolicy: 'Privacy Policy',

    orders: 'Orders',
    items: 'items',
    itemsTotal: 'Items total',
    discount: 'Discount',
    tax: 'Tax',
    customer: 'Customer',
    address: 'Address',
    vouchers: 'Vouchers',
    totalOrders: 'Total orders',

    pleaseLogin: 'Please login',
    loginToSeeOrders: 'Login to see your order history.',
    loading: 'Loading...',
    somethingWentWrong: 'Something went wrong',
    retry: 'Retry',
    noOrdersYet: 'No orders yet',
    yourOrdersWillAppearHere: 'Your recent orders will appear here.',
    notLoggedIn: 'Not logged in',

    sentToStore: 'Sent to store',
    inDelivery: 'In delivery',
    isDelivered: 'Delivered',
    isCancelled: 'Cancelled',
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
    checkout: 'Bestellen',
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
    minimumOrderAmountIs: 'Mindestbestellwert ist',
    requiredChooseAtleast: 'Erforderlich: Wählen Sie mindestens',
    chooseUpTo: 'Wählen Sie bis zu',
    maxReached: 'Maximal erreicht',
    add: 'Hinzufügen',
    selected: 'ausgewählt',
    deliveryNotes: 'Lieferhinweise',
    enterDeliveryNotes: 'Lieferhinweise eingeben...',
    deliveryTime: 'Lieferzeit',

    orderPlacedSuccessfully: 'Bestellung erfolgreich aufgegeben 🎉',
    orderId: 'Bestellnummer',
    redirectingIn: 'Weiterleitung in',
    continue: 'Jetzt fortfahren',
    termAndConditions: 'Allgemeine Geschäftsbedingungen',
    privacyPolicy: 'Datenschutz-Bestimmungen',

    orders: 'Bestellungen',
    items: 'Artikel',
    itemsTotal: 'Zwischensumme',
    discount: 'Rabatt',
    tax: 'Steuer',
    customer: 'Kunde',
    address: 'Adresse',
    vouchers: 'Gutscheine',
    totalOrders: 'Anzahl Bestellungen',

    pleaseLogin: 'Bitte anmelden',
    loginToSeeOrders: 'Melde dich an, um deine Bestellhistorie zu sehen.',
    loading: 'Wird geladen...',
    somethingWentWrong: 'Etwas ist schiefgelaufen',
    retry: 'Erneut versuchen',
    noOrdersYet: 'Noch keine Bestellungen',
    yourOrdersWillAppearHere: 'Deine letzten Bestellungen werden hier angezeigt.',
    notLoggedIn: 'Nicht angemeldet',

    sentToStore: 'An Restaurant gesendet',
    inDelivery: 'In Zustellung',
    isDelivered: 'Geliefert',
    isCancelled: 'Storniert',
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
