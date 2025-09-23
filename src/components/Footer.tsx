export default function Footer() {
  return (
    <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border bg-background-tertiary">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand column */}
          <div className="col-span-1">
            <span className="brand-wordmark text-text-primary text-3xl sm:text-4xl leading-none">uniflow</span>
            <p className="mt-2 text-text-secondary">Your academic management platform</p>
          </div>
          
          {/* Contact section */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Contact</h3>
            <ul className="space-y-2 text-text-secondary">
              <li><span className="text-text-primary font-medium">Email:</span> support@uniflow.ac</li>
              <li><span className="text-text-primary font-medium">Phone:</span> +970 (59) 580-4405</li>
              <li><span className="text-text-primary font-medium">Address:</span> Bethlehem University - Freres st, Bethlehem</li>
            </ul>
          </div>
          
          {/* Support section */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Support</h3>
            <ul className="space-y-2 text-text-secondary">
              <li><a href="#" className="hover:text-text-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-text-primary transition-colors">FAQs</a></li>
              <li><a href="#" className="hover:text-text-primary transition-colors">Contact Support</a></li>
            </ul>
          </div>
          
          {/* Legals section */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Legals</h3>
            <ul className="space-y-2 text-text-secondary">
              <li><a href="#" className="hover:text-text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-text-primary transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        
        {/* Payment methods and copyright */}
        <div className="mt-12 pt-8 border-t border-border">
          {/* Payment icons centered */}
          <div className="flex justify-center items-center gap-6">
            {/* Visa */}
            <svg className="h-6" viewBox="0 0 64 24" aria-label="Visa" role="img">
              <rect x="0" y="0" width="64" height="24" rx="4" fill="#1A1F71" />
              <text x="10" y="16" fill="#ffffff" fontWeight="700" fontSize="12" fontFamily="inherit">VISA</text>
            </svg>

            {/* Mastercard */}
            <svg className="h-6" viewBox="0 0 64 24" aria-label="Mastercard" role="img">
              <rect x="0" y="0" width="64" height="24" rx="4" fill="#fff" />
              <g transform="translate(16,4)">
                <circle cx="8" cy="8" r="8" fill="#EB001B" />
                <circle cx="24" cy="8" r="8" fill="#F79E1B" />
              </g>
            </svg>

            {/* PayPal */}
            <svg className="h-6" viewBox="0 0 80 24" aria-label="PayPal" role="img">
              <rect x="0" y="0" width="80" height="24" rx="4" fill="#003087" />
              <text x="10" y="16" fill="#ffffff" fontWeight="700" fontSize="12" fontFamily="inherit">PayPal</text>
            </svg>
          </div>

          {/* Copyright centered */}
          <p className="mt-6 text-center text-text-muted">© 2025 <span className="brand-text lowercase">uniflow</span>. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
