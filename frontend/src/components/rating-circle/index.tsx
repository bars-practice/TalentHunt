import styles from "./styles.module.css";

interface RatingCircleProps {
  value: number;
  max?: number;
}

export function RatingCircle({ value, max = 5 }: RatingCircleProps) {
  const getColor = (val: number, maxVal: number) => {
    const percentage = val / maxVal;
    
    if (percentage <= 0.2) return styles.red;
    if (percentage <= 0.4) return styles.orange;
    if (percentage <= 0.6) return styles.yellow;
    if (percentage <= 0.8) return styles.lightGreen;
    return styles.green;
  };

  return (
    <div className={`${styles.circle} ${getColor(value, max)}`}>
      {value}
    </div>
  );
}
