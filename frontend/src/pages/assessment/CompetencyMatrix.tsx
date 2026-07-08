import styles from "./styles.module.css";
import { RatingCircle } from "@/components/rating-circle";
import { CompetencyEdit } from "@/components/competency-edit";
import Textarea from "@/components/ui/textarea";
import type { SkillMatrixItem } from "@/api/interviews";

interface CompetencyMatrixProps {
  competencies: SkillMatrixItem[];
  /** Режим редактирования — показывает CompetencyEdit вместо просмотра */
  editing?: boolean;
  onScoreChange?: (competencyId: string, score: number) => void;
  onCommentChange?: (competencyId: string, comment: string) => void;
  generalConclusion?: string;
  onConclusionChange?: (value: string) => void;
}

export function CompetencyMatrix({
  competencies,
  editing = false,
  onScoreChange,
  onCommentChange,
  generalConclusion,
  onConclusionChange,
}: CompetencyMatrixProps) {
  if (editing) {
    return (
      <div className={styles.matrixSection}>
        <h3 className={styles.matrixTitle}>Матрица компетенций</h3>
        <div className={styles.editList}>
          {competencies.map((item) => (
            <CompetencyEdit
              key={item.competencyId}
              title={item.competencyName}
              description={item.competencyDescription}
              value={item.score ?? undefined}
              onChange={(val) => onScoreChange?.(item.competencyId, val)}
              comment={item.comment}
              onCommentChange={(val) => onCommentChange?.(item.competencyId, val)}
            />
          ))}
        </div>
        <div className={styles.conclusionSection}>
          <h3 className={styles.matrixTitle}>Общее заключение</h3>
          <Textarea
            placeholder="Напишите общее заключение по кандидату..."
            value={generalConclusion ?? ""}
            onChange={(e) => onConclusionChange?.(e.target.value)}
            rows={4}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.matrixSection}>
      <h3 className={styles.matrixTitle}>Матрица компетенций</h3>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>КОМПЕТЕНЦИЯ</th>
              <th>ОЦЕНКА</th>
              <th>КОММЕНТАРИЙ</th>
            </tr>
          </thead>
          <tbody>
            {competencies.length === 0 ? (
              <tr>
                <td colSpan={3} className={styles.emptyCell}>
                  Компетенции не добавлены
                </td>
              </tr>
            ) : (
              competencies.map((item) => (
                <tr key={item.competencyId}>
                  <td className={styles.competencyCell}>
                    <div className={styles.competencyName}>{item.competencyName}</div>
                    {item.competencyDescription && (
                      <div className={styles.competencyDescription}>{item.competencyDescription}</div>
                    )}
                  </td>
                  <td className={styles.assessmentCell}>
                    {item.score !== null ? (
                      <RatingCircle value={item.score} />
                    ) : (
                      <span className={styles.assessmentValue}>—</span>
                    )}
                  </td>
                  <td className={styles.commentCell}>
                    <span className={styles.commentValue}>{item.comment || "—"}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {generalConclusion && (
        <div className={styles.conclusionSection}>
          <h3 className={styles.matrixTitle}>Общее заключение</h3>
          <div className={styles.conclusionView}>
            <p className={styles.conclusionText}>{generalConclusion}</p>
          </div>
        </div>
      )}
    </div>
  );
}
