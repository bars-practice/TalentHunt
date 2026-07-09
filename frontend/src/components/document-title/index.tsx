import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { formatDocumentTitle, getRouteTitle } from "@/config/document-title";

export function DocumentTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = formatDocumentTitle(getRouteTitle(pathname));
  }, [pathname]);

  return null;
}
