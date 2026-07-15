import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Πολιτική Απορρήτου — ORBIQ Join" };
export const dynamic = "force-static";

export default function PrivacyPage() {
  return (
    <div className="venue-shell">
      <div className="atmosphere atm-allday" aria-hidden />
      <main className="venue-content mx-auto w-full max-w-2xl px-6 py-12 safe-top safe-bottom">
        <Link href="/" className="text-sm underline underline-offset-2 opacity-70">
          ← ORBIQ Join
        </Link>
        <h1 className="display-serif mt-6 text-3xl">Πολιτική Απορρήτου</h1>
        <div className="prose-invert mt-6 space-y-5 text-[0.9375rem] leading-relaxed opacity-90">
          <section>
            <h2 className="mb-2 text-lg font-bold">Ποιοι είμαστε</h2>
            <p>
              Η πλατφόρμα ORBIQ Join (join.orbi-q.com) λειτουργεί από την ORBIQ και επιτρέπει την
              εγγραφή επισκεπτών στη λίστα (guest list) συνεργαζόμενων καταστημάτων. Για κάθε
              εγγραφή, υπεύθυνος επεξεργασίας είναι το εκάστοτε κατάστημα στο οποίο εγγράφεστε, και
              η ORBIQ ενεργεί ως εκτελούσα την επεξεργασία.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-bold">Ποια δεδομένα συλλέγουμε</h2>
            <p>
              Κατά την εγγραφή σας συλλέγουμε: ονοματεπώνυμο, διεύθυνση email, αριθμό τηλεφώνου,
              ημερομηνία γέννησης, τις συγκαταθέσεις σας (με χρονική σήμανση και έκδοση κειμένου),
              καθώς και τεχνικά στοιχεία απόδοσης της εγγραφής (κατάστημα, πηγή QR, γλώσσα).
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-bold">Σκοπός επεξεργασίας</h2>
            <p>
              Τα δεδομένα χρησιμοποιούνται αποκλειστικά για τη διαχείριση της λίστας επισκεπτών του
              καταστήματος και — εφόσον έχετε δώσει ρητή συγκατάθεση — για την αποστολή
              ενημερώσεων, προσφορών και προσκλήσεων σε εκδηλώσεις. Δεν πωλούνται και δεν
              διαβιβάζονται σε τρίτους για δικούς τους σκοπούς.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-bold">Χρόνος διατήρησης</h2>
            <p>
              Τα δεδομένα διατηρούνται για όσο διάστημα παραμένετε εγγεγραμμένοι στη λίστα του
              καταστήματος ή έως ότου ζητήσετε τη διαγραφή τους.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-bold">Τα δικαιώματά σας</h2>
            <p>
              Έχετε δικαίωμα πρόσβασης, διόρθωσης, διαγραφής, φορητότητας και εναντίωσης, καθώς και
              δικαίωμα ανάκλησης της συγκατάθεσής σας οποιαδήποτε στιγμή. Για την άσκηση των
              δικαιωμάτων σας, επικοινωνήστε με το κατάστημα στο οποίο εγγραφήκατε ή με την ORBIQ
              μέσω του <a className="underline" href="https://orbi-q.com" target="_blank" rel="noopener noreferrer">orbi-q.com</a>.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-bold">Ασφάλεια</h2>
            <p>
              Τα δεδομένα αποθηκεύονται σε ασφαλή βάση δεδομένων με κρυπτογραφημένη μεταφορά και
              περιορισμένη πρόσβαση. Δεν εκτίθενται δημόσια και δεν καταγράφονται σε αρχεία
              καταγραφής ή εργαλεία στατιστικών.
            </p>
          </section>
          <hr className="border-current/10" />
          <section lang="en">
            <h2 className="mb-2 text-lg font-bold">Privacy Policy (English)</h2>
            <p>
              ORBIQ Join collects your full name, email, phone and date of birth solely to manage
              the guest list of the venue you register with and — with your explicit consent — to
              send you updates, offers and event invitations on the venue&apos;s behalf. Each venue is
              the data controller; ORBIQ is the processor. Your data is never sold. You may
              request access, correction, deletion or export at any time by contacting the venue
              or ORBIQ via orbi-q.com.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
