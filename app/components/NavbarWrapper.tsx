'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function NavbarWrapper() {
  const pathname = usePathname();
  const hideNavbarRoutes = ['/auth'];
  const showNavbar = !hideNavbarRoutes.includes(pathname);

  return showNavbar ? <Navbar /> : null;
}