export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="px-6 py-3 text-xs text-gray-500">
        © {new Date().getFullYear()} BRMS — Budget & Requisition Management
      </div>
    </footer>
  );
}
