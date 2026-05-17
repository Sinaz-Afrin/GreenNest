import Link from 'next/link';
import { Leaf } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-secondary/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Leaf className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-primary">GreenNest</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your one-stop destination for plants, gardening supplies, and professional gardening services.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products?category=plants" className="text-muted-foreground hover:text-primary">
                  Plants
                </Link>
              </li>
              <li>
                <Link href="/products?category=seeds" className="text-muted-foreground hover:text-primary">
                  Seeds
                </Link>
              </li>
              <li>
                <Link href="/products?category=pots" className="text-muted-foreground hover:text-primary">
                  Pots
                </Link>
              </li>
              <li>
                <Link href="/products?category=tools" className="text-muted-foreground hover:text-primary">
                  Tools
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/services?service=Home%20Gardening" className="text-muted-foreground hover:text-primary">
                  Home Gardening
                </Link>
              </li>
              <li>
                <Link href="/services?service=Lawn%20Maintenance" className="text-muted-foreground hover:text-primary">
                  Lawn Maintenance
                </Link>
              </li>
              <li>
                <Link href="/services?service=Plant%20Care" className="text-muted-foreground hover:text-primary">
                  Plant Care
                </Link>
              </li>
              <li>
                <Link href="/services?service=Pot%20Arrangement" className="text-muted-foreground hover:text-primary">
                  Pot Arrangement
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/register?role=vendor" className="text-muted-foreground hover:text-primary">
                  Become a Vendor
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} GreenNest. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
