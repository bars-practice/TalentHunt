import { useEffect } from "react";
import { formatDocumentTitle } from "@/config/document-title";

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = formatDocumentTitle(title);
  }, [title]);
}
