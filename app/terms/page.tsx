import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Όροι Χρήσης — ORBIQ Join" };
export const dynamic = "force-static";

export default function TermsPage() {
  return (
    <div className="venue-shell">
      <div className="atmosphere atm-allday" aria-hidden />
      <main className="venue-content mx-auto w-full max-w-2xl px-6 py-12 safe-top safe-bottom">
        <Link href="/" className="text-sm underline underline-offset-2 opacity-70">
          ← ORBIQ Join
        </Link>
        <h1 className="display-serif mt-6 text-3xl">Όροι Χρήσης</h1>
        <div className="mt-6 space-y-5 text-[0.9375rem] leading-relaxed opacity-90">
          <p>
            Η υπηρεσία ORBIQ Join επιτρέπει την εγγραφή σας στη λίστα επισκεπτών του καταστήματος
            του οποίου το QR code σκανάρατε. Η εγγραφή είναι δωρεάν και δεν δημιουργεί λογαριασμό
            χρήστη.
          </p>
          <p>
            Με την εγγραφή σας δηλώνετε ότι είστε τουλάχιστον 18 ετών και ότι τα στοιχεία που
            καταχωρείτε είναι αληθή. Η επεξεργασία των στοιχείων σας περιγράφεται στην{" "}
            <Link href="/privacy" className="underline underline-offset-2">
              Πολιτική Απορρήτου
            </Link>
            .
          </p>
          <p>
            Η αξιολόγηση στο Google είναι προαιρετική, ανεξάρτητη από την εγγραφή, και δεν
            συνδέεται με οποιοδήποτε κίνητρο ή αντάλλαγμα. Κάθε γνώμη — θετική ή αρνητική — είναι
            ευπρόσδεκτη.
          </p>
          <p>
            Μπορείτε να ζητήσετε τη διαγραφή σας από τη λίστα οποιουδήποτε καταστήματος
            οποιαδήποτε στιγμή, επικοινωνώντας με το κατάστημα ή με την ORBIQ.
          </p>
          <p lang="en" className="border-t border-current/10 pt-5">
            ORBIQ Join lets you register on the guest list of the venue whose QR code you scanned.
            Registration is free, requires no account, and is open to persons 18 or older. Google
            reviews are optional, independent of registration, and never incentivized. You may
            request removal from any venue&apos;s list at any time.
          </p>
        </div>
      </main>
    </div>
  );
}
