import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { CandidateInfo } from "./CandidateInfo";
import { CompetencyMatrix } from "./CompetencyMatrix";
import Button from "@/components/ui/button";
import { applicationsService, type Application } from "@/api/applications";
import { candidatesService } from "@/api/candidates";
import { vacanciesService } from "@/api/vacancies";
import {
  interviewsService,
  type InterviewDetail,
  type SkillMatrixItem,
  ApplicationStatus,
} from "@/api/interviews";
import { usePermissions } from "@/hooks/usePermissions";
import { Permission } from "@/utils/permissions";
import { useModal } from "@/providers/ModalProvider";
import styles from "./styles.module.css";

function areAllScoresFilled(matrix: SkillMatrixItem[]): boolean {
  return matrix.length > 0 && matrix.every(item => item.score !== null && item.score !== undefined);
}

function isGeneralConclusionFilled(conclusion: string): boolean {
  return conclusion.trim().length > 0;
}

function parseApplicationStatus(status: Application["status"]): number {
  if (typeof status === "number") return status;
  const map: Record<string, number> = {
    Applied: ApplicationStatus.Applied,
    InProgress: ApplicationStatus.InProgress,
    PendingDecision: ApplicationStatus.PendingDecision,
    Approved: ApplicationStatus.Approved,
    Rejected: ApplicationStatus.Rejected,
  };
  return map[status] ?? ApplicationStatus.Applied;
}

async function loadEmptyInterviewView(application: Application): Promise<InterviewDetail> {
  const [candidate, vacancies] = await Promise.all([
    candidatesService.getById(application.candidateId),
    vacanciesService.getAll(),
  ]);

  const vacancy = vacancies.find(v => v.id === application.vacancyId);

  const skillMatrix: SkillMatrixItem[] = (vacancy?.competencies ?? [])
    .map(competency => ({
      competencyId: competency.id,
      competencyName: competency.name,
      competencyDescription: competency.description ?? "",
      score: null,
      comment: "",
    }))
    .sort((a, b) => a.competencyName.localeCompare(b.competencyName));

  return {
    id: "",
    applicationId: application.id,
    applicationStatus: parseApplicationStatus(application.status),
    candidateId: application.candidateId,
    candidateFullName: candidate.fullName,
    candidatePhone: candidate.phone,
    candidateCity: candidate.city,
    candidateEducation: candidate.education,
    candidateExperience: candidate.experience,
    candidatePlacesOfWork: candidate.placesOfWork,
    vacancyId: application.vacancyId,
    vacancyTitle: vacancy?.title ?? application.vacancyTitle,
    vacancyLevel: vacancy?.level ?? 0,
    scheduledAt: null,
    plan: "",
    interviewerId: null,
    interviewerFullName: null,
    generalConclusion: "",
    skillMatrix,
    isDeleted: false,
  };
}

export function CompetencyAssessment() {
  const { id } = useParams<{ id: string }>();
  const { hasPermission, loading: permissionsLoading } = usePermissions();
  const { openModal, closeModal } = useModal();
  const canManageInterviews = hasPermission(Permission.CanManageInterviews);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interview, setInterview] = useState<InterviewDetail | null>(null);

  // Локальное состояние матрицы для режима редактирования
  const [draftMatrix, setDraftMatrix] = useState<SkillMatrixItem[]>([]);
  const [draftConclusion, setDraftConclusion] = useState("");
  const [saving, setSaving] = useState(false);
  const [starting, setStarting] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);

  const loadInterview = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      setIsSessionActive(false);

      const application = await applicationsService.getById(id);

      if (application.interviewId) {
        const detail = await interviewsService.getById(application.interviewId);
        setInterview(detail);
        setDraftMatrix(detail.skillMatrix);
        setDraftConclusion(detail.generalConclusion);
      } else {
        const emptyView = await loadEmptyInterviewView(application);
        setInterview(emptyView);
        setDraftMatrix(emptyView.skillMatrix);
        setDraftConclusion(emptyView.generalConclusion);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить данные");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (permissionsLoading) return;
    void loadInterview();
  }, [loadInterview, permissionsLoading]);

  const ensureInterview = async (): Promise<InterviewDetail> => {
    if (interview?.id) return interview;
    if (!id) throw new Error("Отклик не найден");

    const created = await interviewsService.create(id);
    setInterview(created);
    setDraftMatrix(created.skillMatrix);
    setDraftConclusion(created.generalConclusion);
    return created;
  };

  const handleStartInterview = async () => {
    if (!interview) return;
    try {
      setStarting(true);
      const current = await ensureInterview();
      const updated = await interviewsService.start(current.id);
      setInterview(updated);
      setDraftMatrix(updated.skillMatrix);
      setDraftConclusion(updated.generalConclusion);
      setIsSessionActive(true);
    } catch (err) {
      console.error("Failed to start interview:", err);
    } finally {
      setStarting(false);
    }
  };

  const handleScheduledAtSave = async (date: string) => {
    if (!interview) return;
    const current = await ensureInterview();
    const updated = await interviewsService.update(current.id, { scheduledAt: date });
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
      const current = await ensureInterview();
      const updated = await interviewsService.update(current.id, {
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
      setIsSessionActive(false);
    } catch (err) {
      console.error("Failed to save interview:", err);
    } finally {
      setSaving(false);
    }
  };

  const showValidationAlert = (title: string, message: string) => {
    openModal(
      <div>
        <p className={styles.modalDescription}>{message}</p>
        <div className={styles.modalActions}>
          <Button variant="outline" onClick={closeModal}>
            Понятно
          </Button>
        </div>
      </div>,
      { title, width: "400px" }
    );
  };

  const handleResumeInterview = () => {
    setDraftMatrix(interview!.skillMatrix);
    setDraftConclusion(interview!.generalConclusion);
    setIsSessionActive(true);
  };

  const handleSubmit = () => {
    if (!areAllScoresFilled(draftMatrix)) {
      showValidationAlert(
        "Не все оценки проставлены",
        "Для завершения собеседования необходимо проставить оценки по всем компетенциям."
      );
      return;
    }
    if (!isGeneralConclusionFilled(draftConclusion)) {
      showValidationAlert(
        "Общее заключение не заполнено",
        "Для завершения собеседования необходимо заполнить общее заключение."
      );
      return;
    }
    void handleSave(false);
  };

  if (loading || permissionsLoading) return <div className={styles.container}>Загрузка...</div>;
  if (error) return <div className={styles.container}>{error}</div>;
  if (!interview) return <div className={styles.container}>Данные не найдены</div>;

  const appStatus = interview.applicationStatus;

  const hasScheduledDate = !!interview.scheduledAt;

  const canStart =
    canManageInterviews &&
    !isSessionActive &&
    appStatus === ApplicationStatus.InProgress &&
    !interview.interviewerId &&
    hasScheduledDate;

  const canResume =
    canManageInterviews &&
    !isSessionActive &&
    appStatus === ApplicationStatus.InProgress &&
    !!interview.interviewerId;

  const isEditing =
    canManageInterviews &&
    isSessionActive &&
    !!interview.interviewerId &&
    appStatus === ApplicationStatus.InProgress;

  const canScheduleDate =
    canManageInterviews &&
    (appStatus === ApplicationStatus.Applied ||
      appStatus === ApplicationStatus.InProgress);

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
          {canResume && (
            <Button
              size="lg"
              variant="primary"
              className={styles.startButton}
              onClick={handleResumeInterview}
            >
              Возобновить собеседование
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
                onClick={handleSubmit}
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
