import { FallbackPage } from "@/components/shared/FallbackPage";

export default function NotFound() {
  return (
    <FallbackPage
      title="Δεν βρέθηκε το κατάστημα"
      body="Το QR που σκάναρες δεν αντιστοιχεί σε ενεργό κατάστημα. Απευθύνσου στο προσωπικό του καταστήματος. — This QR code doesn't match an active venue."
    />
  );
}
