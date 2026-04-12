export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="text-center py-4 mt-auto"
      style={{
        background: 'linear-gradient(135deg, #0a1929, #0f2440)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <p className="text-white/40 text-[11px]">
        Copyright {currentYear} © NIT Jalandhar
      </p>
      <p className="text-white/25 text-[10px] mt-0.5">
        Developed by Computer Science & Engineering Department, Dr. B.R. Ambedkar National Institute of Technology, Jalandhar
      </p>
    </footer>
  );
}
