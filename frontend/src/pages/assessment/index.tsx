import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { CandidateInfo } from "./CandidateInfo";
import { CompetencyMatrix } from "./CompetencyMatrix";
import Button from "@/components/ui/button";
import { applicationsService } from "@/api/applications";
import {
  interviewsService,
  type InterviewDetail,
  type SkillMatrixItem,
  ApplicationStatus,
} from "@/api/interviews";
import { usePermissions } from "@/hooks/usePermissions";
import { Permission } from "@/utils/permissions";
import styles from "./styles.module.css";

export function CompetencyAssessment() {
  const { id } = useParams<{ id: string }>();
  const { hasPermission } = usePermissions();
  const canManageInterviews = hasPermission(Permission.CanManageInterviews);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interview, setInterview] = useState<InterviewDetail | null>(null);

  // Локальное состояние матрицы для режима редактирования
  const [draftMatrix, setDraftMatrix] = useState<SkillMatrixItem[]>([]);
  const [draftConclusion, setDraftConclusion] = useState("");
  const [saving, setSaving] = useState(false);
  const [starting, setStarting] = useState(false);

  const loadInterview = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);

      const application = await applicationsService.getById(id);

      if (application.interviewId) {
        const detail = await interviewsService.getById(application.interviewId);
        setInterview(detail);
        setDraftMatrix(detail.skillMatrix);
        setDraftConclusion(detail.generalConclusion);
      } else {
        if (canManageInterviews) {
          const created = await interviewsService.create(id);
          setInterview(created);
          setDraftMatrix(created.skillMatrix);
          setDraftConclusion(created.generalConclusion);
        } else {
          setError("Собеседование ещё не создано.");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить данные");
    } finally {
      setLoading(false);
    }
  }, [id, canManageInterviews]);

  useEffect(() => {
    void loadInterview();
  }, [loadInterview]);

  const handleStartInterview = async () => {
    if (!interview) return;
    try {
      setStarting(true);
      const updated = await interviewsService.start(interview.id);
      setInterview(updated);
      setDraftMatrix(updated.skillMatrix);
      setDraftConclusion(updated.generalConclusion);
    } catch (err) {
      console.error("Failed to start interview:", err);
    } finally {
      setStarting(false);
    }
  };

  const handleScheduledAtSave = async (date: string) => {
    if (!interview) return;
    const updated = await interviewsService.update(interview.id, { scheduledAt: date });
    setInterview(updated);
  };

  const handleScoreChange = (competencyId: string, score: number) => {
    setDraftMatrix(prev =>
      prev.map(item =>
        item.competencyId === competencyId ? { ...item, score } : item
      )
    );
  };

  const handleCommentChange = (competencyId: string, comment: string) => {
    setDraftMatrix(prev =>
      prev.map(item =>
        item.competencyId === competencyId ? { ...item, comment } : item
      )
    );
  };

  const handleSave = async (isDraft: boolean) => {
    if (!interview) return;
    try {
      setSaving(true);
      const updated = await interviewsService.update(interview.id, {
        skillMatrix: draftMatrix.map(item => ({
          competencyId: item.competencyId,
          score: item.score,
          comment: item.comment || null,
        })),
        generalConclusion: draftConclusion,
        isDraft,
      });
      setInterview(updated);
      setDraftMatrix(updated.skillMatrix);
      setDraftConclusion(updated.generalConclusion);
    } catch (err) {
      console.error("Failed to save interview:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.container}>Загрузка...</div>;
  if (error) return <div className={styles.container}>{error}</div>;
  if (!interview) return <div className={styles.container}>Данные не найдены</div>;

  const appStatus = interview.applicationStatus;

  const hasScheduledDate = !!interview.scheduledAt;

  const canStart =
    canManageInterviews &&
    appStatus === ApplicationStatus.InProgress &&
    !interview.interviewerId &&
    hasScheduledDate;

  const isEditing =
    canManageInterviews &&
    !!interview.interviewerId &&
    (appStatus === ApplicationStatus.InProgress ||
      appStatus === ApplicationStatus.PendingDecision);

  const canScheduleDate =
    canManageInterviews &&
    appStatus !== ApplicationStatus.Approved &&
    appStatus !== ApplicationStatus.Rejected &&
    (appStatus === ApplicationStatus.Applied ||
      (appStatus === ApplicationStatus.InProgress && !interview.interviewerId));

  const interviewDate = interview.scheduledAt
    ? new Date(interview.scheduledAt).toLocaleString("ru-RU")
    : "Не назначено";

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Оценка компетенций</h1>
        <div className={styles.actionButtons}>
          {canStart && (
            <Button
              size="lg"
              variant="primary"
              className={styles.startButton}
              onClick={handleStartInterview}
              disabled={starting}
            >
              {starting ? "Запуск..." : "Начать собеседование"}
            </Button>
          )}
          {isEditing && (
            <>
              <Button
                size="lg"
                variant="outline"
                onClick={() => handleSave(true)}
                disabled={saving}
              >
                Сохранить черновик
              </Button>
              <Button
                size="lg"
                variant="primary"
                onClick={() => handleSave(false)}
                disabled={saving}
              >
                Завершить и отправить
              </Button>
            </>
          )}
        </div>
      </div>

      <CandidateInfo
        name={interview.candidateFullName}
        role={interview.vacancyTitle}
        location={interview.candidateCity}
        phone={interview.candidatePhone}
        education={interview.candidateEducation}
        experience={interview.candidatePlacesOfWork}
        totalExperience={interview.candidateExperience}
        status={appStatus}
        interviewDate={interviewDate}
        scheduledAt={interview.scheduledAt}
        onDateSave={canScheduleDate ? handleScheduledAtSave : undefined}
      />

      <CompetencyMatrix
        competencies={isEditing ? draftMatrix : interview.skillMatrix}
        editing={isEditing}
        onScoreChange={handleScoreChange}
        onCommentChange={handleCommentChange}
        generalConclusion={isEditing ? draftConclusion : interview.generalConclusion}
        onConclusionChange={isEditing ? setDraftConclusion : undefined}
      />
    </div>
  );
}
