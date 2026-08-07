import { IconGithub, IconTwitter, IconLinkedin, IconHeart } from './icons'
import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <p className="footer__text">
        © {new Date().getFullYear()} Eventify. Crafted with
        <IconHeart className="icon footer__heart" />
        for unforgettable events.
      </p>

      <nav className="footer__links">
        <a href="#privacy">Privacy</a>
        <a href="#terms">Terms</a>
        <a href="#support">Support</a>
      </nav>

      <div className="footer__social">
        <a href="https://github.com/sameerofficial545-ctrl" target="_blank" rel="noreferrer" aria-label="GitHub">
          <IconGithub className="icon" />
        </a>
        <a href="#" aria-label="Twitter">
          <IconTwitter className="icon" />
        </a>
        <a href="#" aria-label="LinkedIn">
          <IconLinkedin className="icon" />
        </a>
      </div>
    </footer>
  )
}

export default Footer
