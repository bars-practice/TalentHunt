import { ApplicationStatus } from "@/api/interviews";

export const PrintForm = {
  CandidateCard: "candidateCard",
  InterviewProtocol: "interviewProtocol",
  Invitation: "invitation",
  Rejection: "rejection",
} as const;

export type PrintForm = (typeof PrintForm)[keyof typeof PrintForm];

export interface PrintFormOption {
  type: PrintForm;
  label: string;
}

export function getAvailablePrintForms(applicationStatus: number): PrintFormOption[] {
  if (
    applicationStatus === ApplicationStatus.Approved
    || applicationStatus === ApplicationStatus.Rejected
  ) {
    const decisionForm: PrintFormOption = applicationStatus === ApplicationStatus.Approved
      ? { type: PrintForm.Invitation, label: "Приглашение на работу" }
      : { type: PrintForm.Rejection, label: "Уведомление об отказе" };

    return [
      decisionForm,
      { type: PrintForm.CandidateCard, label: "Карточка кандидата" },
      { type: PrintForm.InterviewProtocol, label: "Протокол собеседования" },
    ];
  }

  if (applicationStatus === ApplicationStatus.PendingDecision) {
    return [
      { type: PrintForm.CandidateCard, label: "Карточка кандидата" },
      { type: PrintForm.InterviewProtocol, label: "Протокол собеседования" },
    ];
  }

  return [
    { type: PrintForm.CandidateCard, label: "Карточка кандидата" },
  ];
}
