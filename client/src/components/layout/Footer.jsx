export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-nitj-navy-dark text-white/60 text-center py-4 mt-auto">
      <p className="text-xs">
        Copyright {currentYear} © NIT Jalandhar
      </p>
      <p className="text-[10px] mt-1">
        Developed by Computer Science & Engineering Department, Dr. B.R. Ambedkar National Institute of Technology, Jalandhar
      </p>
    </footer>
  );
}
