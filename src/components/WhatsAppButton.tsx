// Ghana number from the footer's contact info, in wa.me's international
// format (no "+", no spaces, no leading 0): +233 54 164 4600 -> 233541644600
const WHATSAPP_NUMBER = "233541644600";
const DEFAULT_MESSAGE =
  "Hi Dotted Point, I'd like to know more about your products and services.";

export default function WhatsAppButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-30 w-14 h-14 rounded-full bg-[#25D366] shadow-lg flex items-center justify-center hover:scale-105 hover:bg-[#20BD5A] transition-all"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="white" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.15-.198.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12.001 2C6.478 2 2 6.477 2 12c0 1.98.578 3.83 1.578 5.39L2 22l4.735-1.55A9.94 9.94 0 0 0 12.001 22C17.523 22 22 17.523 22 12S17.523 2 12.001 2Zm0 18.2a8.17 8.17 0 0 1-4.363-1.257l-.313-.187-3.083 1.01 1.023-3.007-.203-.32A8.163 8.163 0 0 1 3.8 12c0-4.526 3.674-8.2 8.201-8.2 4.526 0 8.199 3.674 8.199 8.2 0 4.527-3.673 8.2-8.199 8.2Z" />
      </svg>
    </a>
  );
}
