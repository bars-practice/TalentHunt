import { StatusBadge } from "@/components/status-badge";
import Button from "@/components/ui/button";
import { Edit2, MapPin, Phone, GraduationCap, Briefcase } from "lucide-react";
import styles from "./styles.module.css";

interface CandidateInfoProps {
  name: string;
  role: string;
  location: string;
  phone: string;
  education: string;
  experience: string[];
  totalExperience?: string;
  status: string;
  interviewDate: string;
  onEditDate?: () => void;
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
  onEditDate,
}: CandidateInfoProps) {
  return (
    <div className={styles.candidateInfo}>
      <div className={styles.candidateHeader}>
        <div className={styles.candidateDetails}>
          <h2 className={styles.candidateName}>{name}</h2>
          <div className={styles.candidateRole}>{role}</div>
          
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
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>
                <Briefcase size={16} className={styles.icon} />
              </div>
              <div className={styles.experienceList}>
                {totalExperience && (
                  <span className={styles.experienceTotal}>{totalExperience}</span>
                )}
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
            <StatusBadge text={status} variant="warning" size="lg" />
          </div>
          
          <div className={styles.interviewDateSection}>
            <span className={styles.dateLabel}>Дата собеседования</span>
            <div className={styles.dateRow}>
              <span className={styles.dateValue}>{interviewDate}</span>
              <Button 
                size="icon-sm" 
                variant="ghost" 
                onClick={onEditDate}
              >
                <Edit2 size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
