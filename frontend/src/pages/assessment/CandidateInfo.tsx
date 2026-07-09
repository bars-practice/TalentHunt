import { StatusBadge } from "@/components/status-badge";
import Button from "@/components/ui/button";
import { Edit2, MapPin, Phone, GraduationCap, Briefcase } from "lucide-react";
import { useModal } from "@/providers/ModalProvider";
import { DateTimePickerModal } from "@/components/date-time-picker-modal";
import { getApplicationStatusInfo } from "@/utils/applicationStatus";
import styles from "./styles.module.css";

interface CandidateInfoProps {
  name: string;
  role: string;
  location: string;
  phone: string;
  education: string;
  experience: string[];
  totalExperience?: string;
  status: number;
  interviewDate: string;
  scheduledAt?: string | null;
  onDateSave?: (date: string) => void | Promise<void>;
}

export function CandidateInfo({
  name,
  role,
  location,
  phone,
  education,
  experience,
  totalExperience,
  status,
  interviewDate,
  scheduledAt,
  onDateSave,
}: CandidateInfoProps) {
  const { openModal, closeModal } = useModal();
  const statusInfo = getApplicationStatusInfo(status);

  const handleEditDate = () => {
    openModal(
      <DateTimePickerModal
        initialDate={scheduledAt ?? undefined}
        onSave={async (date) => {
          await onDateSave?.(date);
          closeModal();
        }}
        onCancel={closeModal}
      />,
      { title: "Дата собеседования", width: "400px" }
    );
  };
  return (
    <div className={styles.candidateInfo}>
      <div className={styles.candidateHeader}>
        <div className={styles.candidateDetails}>
          <div>
            <h2 className={styles.candidateName}>{name}<StatusBadge text={statusInfo.text} variant={statusInfo.variant} size="lg" /> </h2>
            <div className={styles.candidateRole}>{role}</div>
          </div>

          <div className={styles.infoSection}>
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>
                <MapPin size={16} className={styles.icon} />
              </div>
              <span className={styles.infoValue}>{location}</span>
            </div>
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>
                <Phone size={16} className={styles.icon} />
              </div>
              <span className={styles.infoValue}>{phone}</span>
            </div>
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>
                <GraduationCap size={16} className={styles.icon} />
              </div>
              <span className={styles.infoValue}>{education}</span>
            </div>
            <div className={styles.infoWork}>
              <Briefcase size={16} className={styles.icon} />
              {totalExperience && (
                <span className={styles.experienceTotal}>{totalExperience}</span>
              )}
              <div className={styles.experienceList}>

                {experience.map((exp, index) => (
                  <span key={index} className={styles.experienceItem}>
                    {exp}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>


        <div className={styles.candidateActions}>
          <div className={styles.statusSection}>
          </div>

          <div className={styles.interviewDateSection}>
            <span className={styles.dateLabel}>Дата собеседования</span>
            <div className={styles.dateRow}>
              <span className={styles.dateValue}>{interviewDate}</span>
              {onDateSave && (
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={handleEditDate}
                >
                  <Edit2 size={16} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
