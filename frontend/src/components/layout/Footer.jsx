export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="nitj-footer">
      <div>Copyright {currentYear} © NIT Jalandhar</div>
      <div>Developed by: Computer Centre, Dr. B.R. Ambedkar National Institute of Technology, Jalandhar</div>
    </footer>
  );
}
