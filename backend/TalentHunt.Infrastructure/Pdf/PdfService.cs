using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using TalentHunt.Application.Enums;
using TalentHunt.Application.Interfaces;

namespace TalentHunt.Infrastructure.Pdf;

public class PdfService(
    ICandidateRepository candidateRepository,
    IApplicationRepository applicationRepository,
    IInterviewRepository interviewRepository,
    ICompetencyRepository competencyRepository) : IPdfService
{
    // Цвета из логотипа
    private static readonly string ColorDark     = "#4F4949";
    private static readonly string ColorRed      = "#D74738";
    private static readonly string ColorGreen    = "#A1C527";
    private static readonly string ColorYellow   = "#F4CB23";
    private static readonly string ColorBlue     = "#5CB3E5";
    private static readonly string ColorBg       = "#F7F7F7";
    private static readonly string ColorBgAccent = "#FFF8F7";

    private static readonly string LogoPath =
        Path.Combine(AppContext.BaseDirectory, "Pdf", "logo.svg");

    static PdfService()
    {
        QuestPDF.Settings.License = LicenseType.Community;
    }

    // ── Карточка кандидата ────────────────────────────────────────────

    public async Task<byte[]> GenerateCandidateCardAsync(
        Guid candidateId, CancellationToken cancellationToken = default)
    {
        var c = await candidateRepository.GetByIdAsync(candidateId, cancellationToken: cancellationToken)
            ?? throw new KeyNotFoundException("Кандидат не найден.");

        return Document.Create(doc =>
        {
            doc.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.MarginHorizontal(1.5f, Unit.Centimetre);
                page.MarginVertical(1.2f, Unit.Centimetre);
                page.DefaultTextStyle(t => t.FontFamily("Arial").FontSize(11).FontColor(ColorDark));

                page.Header().Element(ComposeHeader("КАРТОЧКА КАНДИДАТА"));

                page.Content().PaddingTop(16).Column(col =>
                {
                    col.Spacing(14);

                    // Блок с именем и контактами
                    col.Item().Background(ColorBg).Padding(14).Column(info =>
                    {
                        info.Item()
                            .Text(c.FullName)
                            .FontSize(18).SemiBold().FontColor(ColorDark);

                        info.Item().PaddingTop(6).Row(row =>
                        {
                            row.AutoItem().Text($"☎  {c.Phone}").FontSize(10).FontColor("#777");
                            row.ConstantItem(24);
                            row.AutoItem().Text($"⌂  {c.City}").FontSize(10).FontColor("#777");
                        });
                    });

                    // Секции
                    if (!string.IsNullOrWhiteSpace(c.Skills))
                        col.Item().Element(e => Section(e, "НАВЫКИ", c.Skills, ColorGreen));

                    if (!string.IsNullOrWhiteSpace(c.Education))
                        col.Item().Element(e => Section(e, "ОБРАЗОВАНИЕ", c.Education, ColorBlue));

                    if (!string.IsNullOrWhiteSpace(c.Experience))
                        col.Item().Element(e => Section(e, "ОПЫТ РАБОТЫ", c.Experience, ColorYellow));

                    if (c.PlacesOfWork.Count > 0)
                        col.Item().Element(e => Section(e, "МЕСТА РАБОТЫ",
                            string.Join("\n", c.PlacesOfWork.Select(p => $"• {p}")), ColorRed));
                });

                page.Footer().Element(ComposeFooter());
            });
        }).GeneratePdf();
    }

    // ── Приглашение ───────────────────────────────────────────────────

    public async Task<byte[]> GenerateInvitationAsync(
        Guid applicationId, CancellationToken cancellationToken = default)
    {
        var app = await applicationRepository.GetByIdAsync(applicationId, cancellationToken: cancellationToken)
            ?? throw new KeyNotFoundException("Отклик не найден.");

        if (app.Status != ApplicationStatus.Approved)
            throw new InvalidOperationException("Приглашение можно сформировать только после одобрения кандидата.");

        return Document.Create(doc =>
        {
            doc.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.MarginHorizontal(1.5f, Unit.Centimetre);
                page.MarginVertical(1.2f, Unit.Centimetre);
                page.DefaultTextStyle(t => t.FontFamily("Arial").FontSize(11).FontColor(ColorDark));

                page.Header().Element(ComposeHeader("ПРИГЛАШЕНИЕ НА РАБОТУ"));

                page.Content().PaddingTop(20).Column(col =>
                {
                    col.Spacing(16);

                    col.Item().Text(text =>
                    {
                        text.Span("Уважаемый(ая) ");
                        text.Span(app.Candidate?.FullName ?? "—")
                            .SemiBold().FontColor(ColorRed);
                        text.Span(",");
                    });

                    col.Item().Text(
                        "мы рады сообщить, что вы успешно прошли все этапы отбора " +
                        "и получаете предложение о работе.");

                    // Блок вакансии
                    col.Item().Background(ColorBgAccent)
                        .Border(1).BorderColor(ColorRed)
                        .Padding(14).Column(box =>
                    {
                        box.Item().Text("Вакансия").FontSize(9).FontColor("#999").Italic();
                        box.Item().Text(app.Vacancy?.Title ?? "—")
                            .FontSize(16).SemiBold().FontColor(ColorRed);
                    });

                    col.Item().Text(
                        "Мы ценим ваши знания и опыт и уверены, что вы внесёте " +
                        "значительный вклад в развитие нашей компании. " +
                        "Ждём вас в нашей команде!");

                    if (app.Approver is not null)
                    {
                        col.Item().PaddingTop(20).LineHorizontal(0.5f).LineColor("#DDD");
                        col.Item().Row(row =>
                        {
                            row.AutoItem().Text("Согласующий:  ").FontSize(9).FontColor("#999");
                            row.AutoItem().Text(app.Approver.FullName).FontSize(9).SemiBold();
                        });
                    }

                    if (app.DecidedAt.HasValue)
                    {
                        col.Item().Row(row =>
                        {
                            row.AutoItem().Text("Дата решения:  ").FontSize(9).FontColor("#999");
                            row.AutoItem().Text(app.DecidedAt.Value.ToString("dd.MM.yyyy")).FontSize(9);
                        });
                    }
                });

                page.Footer().Element(ComposeFooter());
            });
        }).GeneratePdf();
    }

    // ── Отказ ─────────────────────────────────────────────────────────

    public async Task<byte[]> GenerateRejectionAsync(
        Guid applicationId, CancellationToken cancellationToken = default)
    {
        var app = await applicationRepository.GetByIdAsync(applicationId, cancellationToken: cancellationToken)
            ?? throw new KeyNotFoundException("Отклик не найден.");

        if (app.Status != ApplicationStatus.Rejected)
            throw new InvalidOperationException("Отказ можно сформировать только после отклонения кандидата.");

        return Document.Create(doc =>
        {
            doc.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.MarginHorizontal(1.5f, Unit.Centimetre);
                page.MarginVertical(1.2f, Unit.Centimetre);
                page.DefaultTextStyle(t => t.FontFamily("Arial").FontSize(11).FontColor(ColorDark));

                page.Header().Element(ComposeHeader("УВЕДОМЛЕНИЕ ОБ ОТКАЗЕ"));

                page.Content().PaddingTop(20).Column(col =>
                {
                    col.Spacing(16);

                    col.Item().Text(text =>
                    {
                        text.Span("Уважаемый(ая) ");
                        text.Span(app.Candidate?.FullName ?? "—").SemiBold();
                        text.Span(",");
                    });

                    col.Item().Text(
                        "благодарим вас за проявленный интерес к нашей компании " +
                        "и время, уделённое участию в конкурсе на вакансию:");

                    col.Item().Background(ColorBg)
                        .BorderLeft(3).BorderColor("#CCCCCC")
                        .Padding(12).Column(box =>
                    {
                        box.Item().Text("Вакансия").FontSize(9).FontColor("#999").Italic();
                        box.Item().Text(app.Vacancy?.Title ?? "—")
                            .FontSize(14).SemiBold();
                    });

                    col.Item().Text(
                        "К сожалению, на данном этапе мы не можем сделать вам предложение. " +
                        "Это решение не означает, что вы не обладаете нужными качествами — " +
                        "мы выбирали из большого числа сильных кандидатов.");

                    col.Item().Text(
                        "Желаем вам успехов в дальнейшем поиске и профессиональном развитии.");

                    if (app.DecidedAt.HasValue)
                    {
                        col.Item().PaddingTop(20).LineHorizontal(0.5f).LineColor("#DDD");
                        col.Item().Row(row =>
                        {
                            row.AutoItem().Text("Дата уведомления:  ").FontSize(9).FontColor("#999");
                            row.AutoItem().Text(app.DecidedAt.Value.ToString("dd.MM.yyyy")).FontSize(9);
                        });
                    }
                });

                page.Footer().Element(ComposeFooter());
            });
        }).GeneratePdf();
    }

    // ── Протокол собеседования ────────────────────────────────────────

public async Task<byte[]> GenerateInterviewProtocolAsync(
    Guid applicationId, CancellationToken cancellationToken = default)
    {
    var iv = await interviewRepository.GetByApplicationIdAsync(applicationId, cancellationToken: cancellationToken)
        ?? throw new KeyNotFoundException("Для данного отклика ещё не создано собеседование.");

    var competencyIds = iv.SkillMatrix.Select(e => e.CompetencyId).Distinct().ToList();
    var competencies = await competencyRepository.GetByIdsAsync(competencyIds, cancellationToken: cancellationToken);
    var competencyNames = competencies.ToDictionary(c => c.Id, c => c.Name);
    var status = iv.Application?.Status;
    var isApproved = status == ApplicationStatus.Approved;
    var isRejected = status == ApplicationStatus.Rejected;

    return Document.Create(doc =>
    {
        doc.Page(page =>
        {
            page.Size(PageSizes.A4);
            page.MarginHorizontal(1.5f, Unit.Centimetre);
            page.MarginVertical(1.2f, Unit.Centimetre);
            page.DefaultTextStyle(t => t.FontFamily("Arial").FontSize(11).FontColor(ColorDark));

            page.Header().Element(ComposeHeader("ПРОТОКОЛ СОБЕСЕДОВАНИЯ"));

            page.Content().PaddingTop(14).Column(col =>
            {
                col.Spacing(14);

                // ── Основная информация ──────────────────────
                col.Item().Element(e => SectionHeader(e, "Основная информация", ColorBlue));
                col.Item().Background(ColorBg).Padding(12).Table(table =>
                {
                    table.ColumnsDefinition(c => { c.ConstantColumn(130); c.RelativeColumn(); });

                    LabelValueRow(table, "Дата",
                        iv.ScheduledAt.HasValue
                            ? iv.ScheduledAt.Value.ToString("dd.MM.yyyy")
                            : "—");
                    LabelValueRow(table, "Вакансия", iv.Application?.Vacancy?.Title ?? "—");
                });

                // ── Кандидат ─────────────────────────────────
                col.Item().Element(e => SectionHeader(e, "Кандидат", ColorBlue));
                col.Item().Background(ColorBg).Padding(12).Table(table =>
                {
                    table.ColumnsDefinition(c => { c.ConstantColumn(130); c.RelativeColumn(); });

                    var cand = iv.Application?.Candidate;
                    LabelValueRow(table, "ФИО", cand?.FullName ?? "—");
                    LabelValueRow(table, "Телефон", cand?.Phone ?? "—");
                });

                // ── Собеседование ─────────────────────────────
                col.Item().Element(e => SectionHeader(e, "Собеседование", ColorBlue));
                col.Item().Background(ColorBg).Padding(12).Table(table =>
                {
                    table.ColumnsDefinition(c => { c.ConstantColumn(130); c.RelativeColumn(); });

                    LabelValueRow(table, "HR", iv.Interviewer?.FullName ?? "—");
                    LabelValueRow(table, "Согласующий", iv.Application?.Approver?.FullName ?? "—");
                });

                // ── Оценка компетенций ────────────────────────
                if (iv.SkillMatrix.Count > 0)
                {
                    col.Item().Element(e => SectionHeader(e, "Оценка компетенций", ColorGreen));
                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(c =>
                        {
                            c.RelativeColumn(4);
                            c.ConstantColumn(55);
                            c.RelativeColumn(5);
                        });

                        table.Header(h =>
                        {
                            h.Cell().Background(ColorGreen).Padding(6)
                                .Text("Компетенция").FontSize(9).SemiBold().FontColor("#FFF");
                            h.Cell().Background(ColorGreen).Padding(6)
                                .Text("Оценка").FontSize(9).SemiBold().FontColor("#FFF").AlignCenter();
                            h.Cell().Background(ColorGreen).Padding(6)
                                .Text("Комментарий").FontSize(9).SemiBold().FontColor("#FFF");
                        });

                        var isEven = false;
                        foreach (var entry in iv.SkillMatrix)
                        {
                            var bg = isEven ? "#F0F0F0" : "#FFFFFF";
                            isEven = !isEven;

                            var scoreText = entry.Score.HasValue
                                ? $"{entry.Score}/5"
                                : "—";

                            table.Cell().Background(bg).Padding(7)
                                .Text(competencyNames.GetValueOrDefault(entry.CompetencyId, "—")).FontSize(10);
                            table.Cell().Background(bg).Padding(7).AlignCenter()
                                .Text(scoreText).FontSize(10).SemiBold().FontColor(
                                    entry.Score >= 4 ? ColorGreen :
                                    entry.Score >= 3 ? ColorYellow : ColorRed);
                            table.Cell().Background(bg).Padding(7)
                                .Text(entry.Comment).FontSize(10);
                        }
                    });
                }

                // ── Комментарий ───────────────────────────────
                if (!string.IsNullOrWhiteSpace(iv.GeneralConclusion))
                {
                    col.Item().Element(e => SectionHeader(e, "Комментарий", ColorBlue));
                    col.Item().Background(ColorBg)
                        .BorderLeft(3).BorderColor(ColorBlue)
                        .Padding(12)
                        .Text(iv.GeneralConclusion).LineHeight(1.5f);
                }

                // ── Решение ───────────────────────────────────
                col.Item().Element(e => SectionHeader(e, "Решение", ColorRed));
                col.Item().Background(ColorBgAccent)
                    .Border(1).BorderColor("#EEE")
                    .Padding(14).Row(row =>
                {
                    row.AutoItem().Column(opt =>
                    {
                        opt.Item().Text(isApproved ? "☑  Принять" : "☐  Принять")
                            .FontSize(13)
                            .FontColor(isApproved ? ColorGreen : "#AAAAAA")
                            .SemiBold();
                    });

                    row.ConstantItem(40);

                    row.AutoItem().Column(opt =>
                    {
                        opt.Item().Text(isRejected ? "☑  Отказать" : "☐  Отказать")
                            .FontSize(13)
                            .FontColor(isRejected ? ColorRed : "#AAAAAA")
                            .SemiBold();
                    });
                });

                // ── Подписи ───────────────────────────────────
                col.Item().PaddingTop(20).Table(table =>
                {
                    table.ColumnsDefinition(c => { c.RelativeColumn(); c.RelativeColumn(); });

                    table.Cell().Padding(8).Column(c =>
                    {
                        c.Item().Text("HR").FontSize(9).FontColor("#999");
                        c.Item().PaddingTop(24).BorderBottom(1).BorderColor(ColorDark).Width(150);
                        c.Item().PaddingTop(4).Text(iv.Interviewer?.FullName ?? "").FontSize(9).FontColor("#999");
                    });

                    table.Cell().Padding(8).Column(c =>
                    {
                        c.Item().Text("Согласующий").FontSize(9).FontColor("#999");
                        c.Item().PaddingTop(24).BorderBottom(1).BorderColor(ColorDark).Width(150);
                        c.Item().PaddingTop(4).Text(iv.Application?.Approver?.FullName ?? "").FontSize(9).FontColor("#999");
                    });
                });
            });

            page.Footer().Element(ComposeFooter());
        });
    }).GeneratePdf();
    }

    // ── Вспомогательные методы ────────────────────────────────────────

    private static Action<IContainer> ComposeHeader(string title) => container =>
    {
        container.Column(col =>
        {
            col.Item().Row(row =>
            {
                // Логотип
                if (File.Exists(LogoPath))
                {
                    var svgContent = File.ReadAllText(LogoPath);
                    svgContent = svgContent
                    .Replace("class=\"st0\"", "fill=\"#4F4949\"")
                    .Replace("class=\"st1\"", "fill=\"#D74738\"")
                    .Replace("class=\"st2\"", "fill=\"#A1C527\"")
                    .Replace("class=\"st3\"", "fill=\"#F4CB23\"")
                    .Replace("class=\"st4\"", "fill=\"#5CB3E5\"");
                row.ConstantItem(120).Height(40).Svg(svgContent);
                }

                row.RelativeItem().AlignRight().AlignBottom()
                    .Text("TalentHunt")
                    .FontSize(9).FontColor("#AAAAAA").Italic();
            });

            // Красная линия
            col.Item().PaddingVertical(6).LineHorizontal(2).LineColor(ColorRed);

            // Заголовок документа
            col.Item().PaddingBottom(4)
                .Text(title)
                .FontSize(15).SemiBold().FontColor(ColorDark).LetterSpacing(0.04f);
        });
    };

    private static Action<IContainer> ComposeFooter() => container =>
    {
        container.Column(col =>
        {
            col.Item().LineHorizontal(0.5f).LineColor("#DDDDDD");
            col.Item().PaddingTop(6).Row(row =>
            {
                row.RelativeItem()
                    .Text($"Сформировано: {DateTime.Now:dd.MM.yyyy}")
                    .FontSize(8).FontColor("#AAAAAA");
                row.RelativeItem().AlignRight()
                    .Text(text =>
                    {
                        text.Span("Страница ").FontSize(8).FontColor("#AAAAAA");
                        text.CurrentPageNumber().FontSize(8).FontColor("#AAAAAA");
                        text.Span(" из ").FontSize(8).FontColor("#AAAAAA");
                        text.TotalPages().FontSize(8).FontColor("#AAAAAA");
                    });
            });
        });
    };

    private static void Section(IContainer container, string title, string body, string accentColor)
    {
        container.Column(col =>
        {
            col.Item().Text(title)
                .FontSize(9).SemiBold().FontColor(accentColor).LetterSpacing(0.06f);
            col.Item().PaddingTop(4)
                .BorderLeft(3).BorderColor(accentColor)
                .PaddingLeft(10)
                .Text(body).FontSize(11).LineHeight(1.5f);
        });
    }

    private static void InfoCell(TableDescriptor table, string label, string? value)
    {
        table.Cell().Padding(5).Column(c =>
        {
            c.Item().Text(label).FontSize(8).FontColor("#999999");
            c.Item().Text(value ?? "—").FontSize(11).SemiBold();
        });
    }

    private static void SectionHeader(IContainer container, string title, string color)
    {
        container.PaddingBottom(2).Column(col =>
        {
            col.Item().Text(title).FontSize(11).SemiBold().FontColor(color);
            col.Item().LineHorizontal(1).LineColor(color);
        });
    }

    private static void LabelValueRow(TableDescriptor table, string label, string value)
    {
        table.Cell().Padding(5).Text(label).FontSize(9).FontColor("#888888");
        table.Cell().Padding(5).Text(value).FontSize(11).SemiBold();
    }
}