export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="nitj-footer">
      <div className="nitj-footer-inner">
        <span>Copyright {currentYear} &copy; NIT Jalandhar</span>
        <span className="nitj-footer-dot" aria-hidden="true">·</span>
        <span>Developed by: Computer Centre, Dr. B.R. Ambedkar National Institute of Technology, Jalandhar</span>
      </div>
    </footer>
  );
}
