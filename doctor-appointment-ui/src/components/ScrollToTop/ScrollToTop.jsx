import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Disable browser automatic scroll restoration
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // Scroll to top after route change
    window.scrollTo(0, 0);

    const timer = setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname, search]);

  return null;
}

export default ScrollToTop;
