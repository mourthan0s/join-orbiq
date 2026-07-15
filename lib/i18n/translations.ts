export type Locale = "el" | "en";

export const locales: Locale[] = ["el", "en"];
export const defaultLocale: Locale = "el";

const el = {
  // Landing
  joinCta: "Μπες στη λίστα",
  takesSeconds: "Μόνο λίγα δευτερόλεπτα",
  reviewCtaSubtle: "Αξιολόγησέ μας στο Google",
  poweredBy: "Powered by",

  // Form
  formTitle: "Μπες στη λίστα",
  fullNameLabel: "Ονοματεπώνυμο",
  fullNamePlaceholder: "π.χ. Μαρία Παπαδοπούλου",
  emailLabel: "Email",
  emailPlaceholder: "you@example.com",
  phoneLabel: "Τηλέφωνο",
  phonePlaceholder: "+30 69X XXX XXXX",
  birthdayLabel: "Ημερομηνία γέννησης",
  termsConsentLabel: "Αποδέχομαι τους {terms} και την {privacy}.",
  termsLinkText: "Όρους Χρήσης",
  privacyLinkText: "Πολιτική Απορρήτου",
  marketingConsentLabel:
    "Θέλω να λαμβάνω ενημερώσεις, προσφορές και προσκλήσεις σε εκδηλώσεις από το {venue}.",
  submit: "Ολοκλήρωση εγγραφής",
  submitting: "Αποστολή…",
  close: "Κλείσιμο",
  back: "Πίσω",

  // Field errors
  errorFullName: "Συμπλήρωσε το ονοματεπώνυμό σου.",
  errorEmail: "Συμπλήρωσε ένα έγκυρο email.",
  errorPhone: "Συμπλήρωσε ένα έγκυρο τηλέφωνο.",
  errorBirthday: "Απαιτείται έγκυρη ημερομηνία γέννησης (18 ετών και άνω).",
  errorTermsConsent: "Χρειάζεται η αποδοχή των όρων για να συνεχίσεις.",
  errorMarketingConsent: "Η εγγραφή στη λίστα απαιτεί τη συγκατάθεσή σου.",
  errorForm: "Έλεγξε τα στοιχεία και προσπάθησε ξανά.",

  // Submission states
  errorNetwork: "Πρόβλημα σύνδεσης. Τα στοιχεία σου δεν χάθηκαν — προσπάθησε ξανά.",
  errorServer: "Κάτι πήγε στραβά. Προσπάθησε ξανά σε λίγο.",
  errorRateLimited: "Πολλές προσπάθειες. Δοκίμασε ξανά σε λίγα λεπτά.",

  // Success
  successTitle: "Είσαι μέσα!",
  successBody: "Η εγγραφή σου ολοκληρώθηκε.",
  alreadyRegistered: "Τα στοιχεία σου ενημερώθηκαν — ήσουν ήδη στη λίστα.",
  reviewCtaPrimary: "Αξιολόγησέ μας στο Google",
  continueToWebsite: "Συνέχεια στο site",
  continueToInstagram: "Δες μας στο Instagram",
  stayHere: "Παραμονή εδώ",
  redirectingIn: "Μετάβαση στο site σε {seconds}″",
  cancelRedirect: "Ακύρωση",

  // Fallback pages
  invalidVenueTitle: "Δεν βρέθηκε το κατάστημα",
  invalidVenueBody:
    "Το QR που σκάναρες δεν αντιστοιχεί σε ενεργό κατάστημα. Απευθύνσου στο προσωπικό του καταστήματος.",
  inactiveVenueTitle: "Οι εγγραφές είναι προσωρινά κλειστές",
  inactiveVenueBody: "Οι εγγραφές για αυτό το κατάστημα δεν είναι διαθέσιμες αυτή τη στιγμή.",
  rootTitle: "ORBIQ Join",
  rootBody: "Σκάναρε το QR code του καταστήματος για να ανοίξει η σελίδα εγγραφής του.",

  // Location context
  locationPrefix: "Κατάστημα",
} as const;

const en: Record<keyof typeof el, string> = {
  joinCta: "Join the List",
  takesSeconds: "Takes just a few seconds",
  reviewCtaSubtle: "Rate us on Google",
  poweredBy: "Powered by",

  formTitle: "Join the List",
  fullNameLabel: "Full name",
  fullNamePlaceholder: "e.g. Maria Papadopoulou",
  emailLabel: "Email",
  emailPlaceholder: "you@example.com",
  phoneLabel: "Phone",
  phonePlaceholder: "+30 69X XXX XXXX",
  birthdayLabel: "Date of birth",
  termsConsentLabel: "I accept the {terms} and the {privacy}.",
  termsLinkText: "Terms of Use",
  privacyLinkText: "Privacy Policy",
  marketingConsentLabel:
    "I want to receive updates, offers and event invitations from {venue}.",
  submit: "Complete registration",
  submitting: "Submitting…",
  close: "Close",
  back: "Back",

  errorFullName: "Please enter your full name.",
  errorEmail: "Please enter a valid email.",
  errorPhone: "Please enter a valid phone number.",
  errorBirthday: "A valid date of birth is required (18+).",
  errorTermsConsent: "You need to accept the terms to continue.",
  errorMarketingConsent: "Joining the list requires your consent.",
  errorForm: "Please check your details and try again.",

  errorNetwork: "Connection problem. Your details are safe — please try again.",
  errorServer: "Something went wrong. Please try again shortly.",
  errorRateLimited: "Too many attempts. Try again in a few minutes.",

  successTitle: "You're in!",
  successBody: "Your registration is complete.",
  alreadyRegistered: "Your details were updated — you were already on the list.",
  reviewCtaPrimary: "Leave a Google Review",
  continueToWebsite: "Continue to website",
  continueToInstagram: "Find us on Instagram",
  stayHere: "Stay here",
  redirectingIn: "Continuing to the website in {seconds}s",
  cancelRedirect: "Cancel",

  invalidVenueTitle: "Venue not found",
  invalidVenueBody:
    "This QR code doesn't match an active venue. Please ask the venue staff for help.",
  inactiveVenueTitle: "Registrations temporarily closed",
  inactiveVenueBody: "Registrations for this venue are not available right now.",
  rootTitle: "ORBIQ Join",
  rootBody: "Scan the venue's QR code to open its registration page.",

  locationPrefix: "Location",
};

const dictionaries: Record<Locale, Record<keyof typeof el, string>> = { el, en };

export type TranslationKey = keyof typeof el;

export function getDictionary(locale: Locale) {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}

/** Simple {placeholder} interpolation. */
export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? `{${key}}`));
}

export function resolveLocale(
  venueDefault: string | null | undefined,
  requested: string | null | undefined
): Locale {
  if (requested === "en" || requested === "el") return requested;
  if (venueDefault === "en" || venueDefault === "el") return venueDefault;
  return defaultLocale;
}
