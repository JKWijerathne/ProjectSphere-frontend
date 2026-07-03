import { Link } from 'react-router-dom';

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <Link className="footer-logo" to="/">
            <span className="footer-logo-mark">PS</span>
            <span>ProjectSphere</span>
          </Link>
          <p>Student projects, lecturer review, and recruiter discovery in one academic portfolio platform.</p>
        </div>

        <div className="footer-meta">
          <span>University project showcase</span>
          <span>© {year} ProjectSphere</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
