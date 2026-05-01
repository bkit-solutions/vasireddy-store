"use client";

// Replace with the actual WhatsApp business number (country code + number, no + or spaces)
const WHATSAPP_NUMBER = "+919502704241";
const DEFAULT_MESSAGE = "Hi, I came across Vasireddy Designer Studio and would love to know more about your collection!";

export function WhatsAppButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-[0_8px_24px_rgba(0,0,0,0.25)] transition hover:scale-110 hover:shadow-[0_12px_28px_rgba(37,211,102,0.55)] active:scale-95 md:bottom-7 md:right-7"
    >
      {/* WhatsApp SVG icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        width="28"
        height="28"
        fill="white"
        aria-hidden="true"
      >
        <path d="M16 .4C7.4.4.4 7.4.4 16c0 2.8.74 5.5 2.15 7.88L.4 31.6l7.94-2.08A15.6 15.6 0 0016 31.6C24.6 31.6 31.6 24.6 31.6 16S24.6.4 16 .4zm0 28.47a13.03 13.03 0 01-6.64-1.82l-.47-.28-4.72 1.24 1.25-4.6-.31-.48A12.91 12.91 0 013.13 16c0-7.12 5.75-12.87 12.87-12.87S28.87 8.88 28.87 16 23.12 28.87 16 28.87zm7.07-9.64c-.39-.2-2.3-1.13-2.65-1.26-.36-.13-.62-.2-.88.19-.26.39-1.01 1.26-1.24 1.52-.23.26-.45.29-.84.1-.39-.2-1.64-.6-3.13-1.92-1.15-1.03-1.93-2.3-2.16-2.69-.22-.39-.02-.6.17-.8.17-.17.39-.45.58-.68.2-.22.26-.38.39-.64.13-.26.06-.49-.03-.68-.1-.2-.88-2.11-1.2-2.89-.32-.76-.64-.66-.88-.67h-.75c-.26 0-.68.1-1.04.49-.36.39-1.36 1.33-1.36 3.23s1.39 3.74 1.58 4c.2.26 2.74 4.18 6.63 5.86.93.4 1.65.64 2.22.82.93.3 1.78.26 2.45.16.74-.11 2.3-.94 2.62-1.85.32-.9.32-1.68.22-1.85-.1-.17-.36-.26-.74-.45z" />
      </svg>
    </a>
  );
}
