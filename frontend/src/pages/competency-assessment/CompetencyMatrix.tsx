import styles from "./styles.module.css";

interface CompetencyItem {
  id: string;
  name: string;
  description: string;
  assessment?: string;
  comment?: string;
}

interface CompetencyMatrixProps {
  competencies: CompetencyItem[];
}

export function CompetencyMatrix({ 
  competencies
}: CompetencyMatrixProps) {
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
              competencies.map((competency) => (
                <tr key={competency.id}>
                  <td className={styles.competencyCell}>
                    <div className={styles.competencyName}>{competency.name}</div>
                    <div className={styles.competencyDescription}>{competency.description}</div>
                  </td>
                  <td className={styles.assessmentCell}>
                    <span className={styles.assessmentValue}>-</span>
                  </td>
                  <td className={styles.commentCell}>
                    <span className={styles.commentValue}>-</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
