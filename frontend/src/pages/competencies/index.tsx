import { useState } from "react";
import { CompetencyEdit } from "@/components/competency-edit";
import Textarea from "@/components/ui/textarea";
import styles from "./styles.module.css";

export function Competencies() {
  const [ratings, setRatings] = useState<Record<string, number>>({
    "1": 1,
    "2": 2,
    "3": 5,
    "4": 3,
  });

  const [notes, setNotes] = useState<Record<string, string>>({
    "1": "",
    "2": "",
    "3": "",
    "4": "",
  });

  const competencies = [
    { 
      id: "1", 
      name: "JavaScript", 
      description: "Основы синтаксиса языка JavaScript, включая современные стандарты ES6+. Глубокое понимание асинхронного программирования, работы с событиями, механизма Event Loop, областей видимости, замыканий, прототипного наследования и манипуляций с DOM-деревом." 
    },
    { 
      id: "2", 
      name: "React", 
      description: "Разработка пользовательских интерфейсов с использованием библиотеки React. Архитектура functional-компонентов, управление внутренним состоянием, кастомные хуки, оптимизация производительности через мемоизацию, интеграция сторонних стейт-менеджеров и экосистема библиотеки." 
    },
    { 
      id: "3", 
      name: "TypeScript", 
      description: "Строгая типизация приложений для обеспечения надежности кода. Проектирование сложных типов, использование интерфейсов, дженериков, утилитных типов, advanced-концепций вроде Mapped и Conditional Types, а также интеграция компилятора в сборочные процессы проекта." 
    },
    { 
      id: "4", 
      name: "CSS", 
      description: "Современная верстка и стилизация интерфейсов. Уверенное владение Flexbox и CSS Grid для создания отзывчивой и адаптивной разметки. Работа с методологиями организации стилей, CSS-переменными, препроцессорами, сложными анимациями и оптимизацией рендеринга страниц." 
    },
  ];

  const handleRatingChange = (competencyId: string, value: number) => {
    setRatings((prev) => ({ ...prev, [competencyId]: value }));
  };

  const handleNoteChange = (competencyId: string, text: string) => {
    setNotes((prev) => ({ ...prev, [competencyId]: text }));
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Управление компетенциями</h1>

      <div className={styles.matrix}>
        {competencies.map((competency) => (
          <div key={competency.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.name}>{competency.name}</div>
              <CompetencyEdit
                value={ratings[competency.id]}
                onChange={(value) => handleRatingChange(competency.id, value)}
              />
            </div>

            <div className={styles.description}>{competency.description}</div>

            <Textarea
              value={notes[competency.id]}
              onChange={(e) => handleNoteChange(competency.id, e.target.value)}
              placeholder="Заметки интервьюера..."
              rows={3}
              className={styles.notesTextarea} 
            />
          </div>
        ))}
      </div>
    </div>
  );
}
