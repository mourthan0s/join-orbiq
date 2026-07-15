import { FallbackPage } from "@/components/shared/FallbackPage";

export const dynamic = "force-static";

export default function RootPage() {
  return (
    <FallbackPage
      title="ORBIQ Join"
      body="Σκάναρε το QR code του καταστήματος για να ανοίξει η σελίδα εγγραφής του. Scan the venue's QR code to open its registration page."
    />
  );
}
