using TalentHunt.Application.DTO;
using TalentHunt.Application.Entities;
using TalentHunt.Application.Enums;
using TalentHunt.Application.Interfaces;

namespace TalentHunt.Application.Services;

public class InterviewService(
    IInterviewRepository interviewRepository,
    IApplicationRepository applicationRepository,
    IVacancyRepository vacancyRepository,
    IUserRepository userRepository) : IInterviewService
{
    private const int MinScore = 1;
    private const int MaxScore = 5;

    public async Task<IEnumerable<InterviewListItemResponse>> GetAllAsync(
        Guid? candidateId = null,
        Guid? vacancyId = null,
        ApplicationStatus? applicationStatus = null,
        bool includeDeleted = false,
        Role? callerRole = null,
        Guid? callerUserId = null,
        CancellationToken cancellationToken = default)
    {
        Guid? approverUserId = callerRole == Role.Approver ? callerUserId : null;

        var interviews = await interviewRepository.GetAllAsync(
            candidateId,
            vacancyId,
            applicationStatus,
            approverUserId,
            includeDeleted,
            cancellationToken);

        return interviews.Select(ToListItemResponse);
    }

    public async Task<InterviewDetailResponse> GetByIdAsync(
        Guid id,
        bool includeDeleted = false,
        Role? callerRole = null,
        Guid? callerUserId = null,
        CancellationToken cancellationToken = default)
    {
        var interview = await interviewRepository.GetByIdAsync(id, includeDeleted, cancellationToken)
            ?? throw new KeyNotFoundException("Собеседование не найдено.");

        if (callerRole == Role.Approver && !CanApproverAccess(interview, callerUserId))
            throw new KeyNotFoundException("Собеседование не найдено.");

        return ToDetailResponse(interview);
    }

    public async Task<InterviewDetailResponse> CreateAsync(
        CreateInterviewRequest request,
        CancellationToken cancellationToken = default)
    {
        var application = await applicationRepository.GetByIdAsync(request.ApplicationId, cancellationToken: cancellationToken)
            ?? throw new InvalidOperationException("Отклик не найден.");

        if (application.Status != ApplicationStatus.Applied)
            throw new InvalidOperationException("Собеседование можно создать только для отклика в статусе Applied.");

        if (await interviewRepository.GetByApplicationIdAsync(request.ApplicationId, cancellationToken: cancellationToken) is not null)
            throw new InvalidOperationException("Собеседование для этого отклика уже существует.");

        var vacancy = await vacancyRepository.GetByIdWithCompetenciesAsync(
            application.VacancyId,
            cancellationToken: cancellationToken)
            ?? throw new InvalidOperationException("Вакансия не найдена.");

        var competencyIds = GetActiveVacancyCompetencyIds(vacancy);
        if (competencyIds.Count == 0)
            throw new InvalidOperationException("Невозможно создать собеседование: у вакансии нет компетенций.");

        var interview = new Interview
        {
            Id = Guid.NewGuid(),
            ApplicationId = request.ApplicationId,
            ScheduledAt = request.ScheduledAt,
            Plan = request.Plan?.Trim() ?? string.Empty,
            SkillMatrix = competencyIds
                .Select(id => new SkillMatrixEntry { CompetencyId = id })
                .ToList()
        };

        await interviewRepository.AddAsync(interview, cancellationToken);
        await interviewRepository.SaveAsync(cancellationToken);

        var created = await interviewRepository.GetByIdAsync(interview.Id, cancellationToken: cancellationToken);
        return ToDetailResponse(created!);
    }

    public async Task<InterviewDetailResponse> StartAsync(
        Guid id,
        Guid interviewerUserId,
        CancellationToken cancellationToken = default)
    {
        var interview = await interviewRepository.GetByIdAsync(id, cancellationToken: cancellationToken)
            ?? throw new KeyNotFoundException("Собеседование не найдено.");

        if (interview.Application.Status != ApplicationStatus.Applied)
            throw new InvalidOperationException("Начать можно только собеседование для отклика в статусе Applied.");

        if (interview.InterviewerId.HasValue)
            throw new InvalidOperationException("Собеседование уже начато.");

        var interviewer = await userRepository.GetByIdWithPermissionsAsync(interviewerUserId)
            ?? throw new InvalidOperationException("Пользователь не найден.");

        if (interviewer.Role is not (Role.HR or Role.Admin or Role.SuperAdmin))
            throw new InvalidOperationException("Интервьюером может быть только пользователь с ролью HR, Admin или SuperAdmin.");

        interview.InterviewerId = interviewerUserId;
        interview.Application.Status = ApplicationStatus.InProgress;

        await interviewRepository.UpdateAsync(interview);
        await applicationRepository.UpdateAsync(interview.Application);
        await interviewRepository.SaveAsync(cancellationToken);

        var updated = await interviewRepository.GetByIdAsync(id, cancellationToken: cancellationToken);
        return ToDetailResponse(updated!);
    }

    public async Task<InterviewDetailResponse> UpdateAsync(
        Guid id,
        UpdateInterviewRequest request,
        CancellationToken cancellationToken = default)
    {
        var interview = await interviewRepository.GetByIdAsync(id, cancellationToken: cancellationToken)
            ?? throw new KeyNotFoundException("Собеседование не найдено.");

        var status = interview.Application.Status;

        if (status is ApplicationStatus.Approved or ApplicationStatus.Rejected)
            throw new UnauthorizedAccessException("Нельзя редактировать собеседование с принятым решением.");

        if (status is not (ApplicationStatus.InProgress or ApplicationStatus.PendingDecision))
            throw new InvalidOperationException(
                "Редактировать собеседование можно только в статусе InProgress или PendingDecision.");

        if (request.ScheduledAt.HasValue)
            interview.ScheduledAt = request.ScheduledAt;

        if (request.Plan is not null)
            interview.Plan = request.Plan.Trim();

        if (request.GeneralConclusion is not null)
            interview.GeneralConclusion = request.GeneralConclusion.Trim();

        if (request.SkillMatrix is not null)
        {
            var vacancyCompetencyIds = GetActiveVacancyCompetencyIds(interview.Application.Vacancy);
            interview.SkillMatrix = MergeSkillMatrix(
                interview.SkillMatrix,
                request.SkillMatrix,
                vacancyCompetencyIds,
                validateScores: !request.IsDraft);
        }

        if (!request.IsDraft)
        {
            ValidateForSubmission(interview, GetActiveVacancyCompetencyIds(interview.Application.Vacancy));

            if (status == ApplicationStatus.InProgress)
            {
                interview.Application.Status = ApplicationStatus.PendingDecision;
                await applicationRepository.UpdateAsync(interview.Application);
            }
        }

        await interviewRepository.UpdateAsync(interview);
        await interviewRepository.SaveAsync(cancellationToken);

        var updated = await interviewRepository.GetByIdAsync(id, cancellationToken: cancellationToken);
        return ToDetailResponse(updated!);
    }

    public async Task DeleteAsync(
        Guid id,
        bool includeDeleted = false,
        CancellationToken cancellationToken = default)
    {
        var interview = await interviewRepository.GetByIdAsync(id, includeDeleted, cancellationToken)
            ?? throw new KeyNotFoundException("Собеседование не найдено.");

        if (interview.IsDeleted)
            return;

        await interviewRepository.DeleteAsync(interview);
        await interviewRepository.SaveAsync(cancellationToken);
    }

    private static List<Guid> GetActiveVacancyCompetencyIds(Vacancy vacancy) =>
        vacancy.VacancyCompetencies
            .Where(vc => vc.Competency is not null && !vc.Competency.IsDeleted)
            .Select(vc => vc.CompetencyId)
            .Distinct()
            .ToList();

    private static List<SkillMatrixEntry> MergeSkillMatrix(
        IReadOnlyList<SkillMatrixEntry> current,
        IReadOnlyList<SkillMatrixItemRequest> incoming,
        IReadOnlyCollection<Guid> allowedCompetencyIds,
        bool validateScores)
    {
        var allowedSet = allowedCompetencyIds.ToHashSet();
        var incomingById = incoming.ToDictionary(x => x.CompetencyId);

        foreach (var item in incoming)
        {
            if (!allowedSet.Contains(item.CompetencyId))
                throw new InvalidOperationException("Компетенция не относится к вакансии.");

            if (item.Score.HasValue && (item.Score.Value < MinScore || item.Score.Value > MaxScore))
                throw new InvalidOperationException("Оценка должна быть от 1 до 5.");
        }

        if (validateScores)
        {
            foreach (var competencyId in allowedSet)
            {
                if (!incomingById.TryGetValue(competencyId, out var item) || !item.Score.HasValue)
                    throw new InvalidOperationException(
                        "Для отправки на решение необходимо заполнить все оценки компетенций и общее заключение.");
            }
        }

        var currentById = current.ToDictionary(x => x.CompetencyId);
        var result = new List<SkillMatrixEntry>();

        foreach (var competencyId in allowedCompetencyIds)
        {
            if (incomingById.TryGetValue(competencyId, out var incomingItem))
            {
                result.Add(new SkillMatrixEntry
                {
                    CompetencyId = competencyId,
                    Score = incomingItem.Score,
                    Comment = incomingItem.Comment?.Trim() ?? string.Empty
                });
            }
            else if (currentById.TryGetValue(competencyId, out var existing))
            {
                result.Add(existing);
            }
            else
            {
                result.Add(new SkillMatrixEntry { CompetencyId = competencyId });
            }
        }

        return result;
    }

    private static void ValidateForSubmission(Interview interview, IReadOnlyCollection<Guid> competencyIds)
    {
        if (string.IsNullOrWhiteSpace(interview.GeneralConclusion))
            throw new InvalidOperationException(
                "Для отправки на решение необходимо заполнить все оценки компетенций и общее заключение.");

        var matrixByCompetency = interview.SkillMatrix.ToDictionary(x => x.CompetencyId);

        foreach (var competencyId in competencyIds)
        {
            if (!matrixByCompetency.TryGetValue(competencyId, out var entry)
                || !entry.Score.HasValue
                || entry.Score.Value < MinScore
                || entry.Score.Value > MaxScore)
            {
                throw new InvalidOperationException(
                    "Для отправки на решение необходимо заполнить все оценки компетенций и общее заключение.");
            }
        }
    }

    private static bool CanApproverAccess(Interview interview, Guid? callerUserId) =>
        callerUserId.HasValue
        && interview.Application.ApproverId == callerUserId
        && CanApproverView(interview);

    private static bool CanApproverView(Interview interview) =>
        interview.Application.Status is ApplicationStatus.PendingDecision
            or ApplicationStatus.Approved
            or ApplicationStatus.Rejected;

    private static InterviewListItemResponse ToListItemResponse(Interview interview) => new(
        interview.Id,
        interview.ApplicationId,
        interview.Application.CandidateId,
        interview.Application.Candidate?.FullName ?? string.Empty,
        interview.Application.VacancyId,
        interview.Application.Vacancy?.Title ?? string.Empty,
        interview.Application.Status,
        interview.ScheduledAt,
        interview.InterviewerId,
        interview.Interviewer?.FullName
    );

    private static InterviewDetailResponse ToDetailResponse(Interview interview)
    {
        var vacancy = interview.Application.Vacancy;
        var matrixByCompetency = interview.SkillMatrix.ToDictionary(x => x.CompetencyId);

        var skillMatrix = vacancy.VacancyCompetencies
            .Where(vc => vc.Competency is not null && !vc.Competency.IsDeleted)
            .Select(vc =>
            {
                matrixByCompetency.TryGetValue(vc.CompetencyId, out var entry);
                return new SkillMatrixItemResponse(
                    vc.CompetencyId,
                    vc.Competency!.Name,
                    vc.Competency.Description,
                    entry?.Score,
                    entry?.Comment ?? string.Empty);
            })
            .OrderBy(x => x.CompetencyName)
            .ToList();

        var candidate = interview.Application.Candidate;

        return new InterviewDetailResponse(
            interview.Id,
            interview.ApplicationId,
            interview.Application.Status,
            interview.Application.CandidateId,
            candidate?.FullName ?? string.Empty,
            candidate?.Phone ?? string.Empty,
            candidate?.City ?? string.Empty,
            candidate?.Education ?? string.Empty,
            candidate?.Experience ?? string.Empty,
            candidate?.PlacesOfWork ?? [],
            interview.Application.VacancyId,
            vacancy?.Title ?? string.Empty,
            vacancy?.Level ?? VacancyLevel.Junior,
            interview.ScheduledAt,
            interview.Plan,
            interview.InterviewerId,
            interview.Interviewer?.FullName,
            interview.GeneralConclusion,
            skillMatrix,
            interview.IsDeleted
        );
    }

    public async Task<InterviewDetailResponse> ForceSetStatusAsync(
    Guid interviewId,
    ApplicationStatus status,
    CancellationToken cancellationToken = default)
    {
    var interview = await interviewRepository.GetByIdAsync(interviewId, includeDeleted: true, cancellationToken)
        ?? throw new KeyNotFoundException("Собеседование не найдено.");

    interview.Application.Status = status;

    await applicationRepository.UpdateAsync(interview.Application);
    await interviewRepository.SaveAsync(cancellationToken);

    var updated = await interviewRepository.GetByIdAsync(interviewId, includeDeleted: true, cancellationToken);
    return ToDetailResponse(updated!);
    }
}
