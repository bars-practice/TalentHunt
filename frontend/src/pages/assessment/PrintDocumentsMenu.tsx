import { FileDown, ChevronDown } from "lucide-react";
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
} from "@/components/ui/menubar";
import { getAvailablePrintForms, PrintForm, type PrintFormOption } from "@/utils/printForms";
import styles from "./styles.module.css";

interface PrintDocumentsMenuProps {
  applicationStatus: number;
  downloadingForm: PrintForm | null;
  onDownload: (form: PrintFormOption) => void;
}

export function PrintDocumentsMenu({
  applicationStatus,
  downloadingForm,
  onDownload,
}: PrintDocumentsMenuProps) {
  const forms = getAvailablePrintForms(applicationStatus);

  if (forms.length === 0) return null;

  const isDownloading = downloadingForm !== null;

  return (
    <Menubar className={styles.printMenubar}>
      <MenubarMenu>
        <MenubarTrigger
          className={styles.printMenuTrigger}
          disabled={isDownloading}
        >
          <FileDown size={20} />
          <span>{isDownloading ? "Формирование..." : "Распечатать протокол"}</span>
          <ChevronDown size={16} className={styles.printMenuChevron} />
        </MenubarTrigger>
        <MenubarContent align="end" className={styles.printMenuContent}>
          {forms.map((form) => (
            <MenubarItem
              key={form.type}
              className={styles.printMenuItem}
              disabled={isDownloading}
              onClick={() => onDownload(form)}
            >
              {form.label}
            </MenubarItem>
          ))}
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
