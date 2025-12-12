export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="px-6 py-3 flex items-center justify-between text-xs text-gray-500">
        <div>
          © {new Date().getFullYear()} FIMS — Financial Information Management System        </div>
        <a
          href="https://forms.office.com/r/your-form-id"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-ems-green-600 hover:text-ems-green-700 transition-colors font-medium"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Share Feedback
        </a>
      </div>
    </footer>
  );
}