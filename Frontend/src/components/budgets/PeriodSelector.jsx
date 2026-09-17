import PropTypes from 'prop-types';
import { IconButton } from '../ui/IconButton';
import './PeriodSelector.css';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function PeriodSelector({ month, year, onMonthChange, onYearChange }) {
  const handlePrevMonth = () => {
    if (month === 1) {
      onMonthChange(12);
      onYearChange(year - 1);
    } else {
      onMonthChange(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      onMonthChange(1);
      onYearChange(year + 1);
    } else {
      onMonthChange(month + 1);
    }
  };

  // Generate a range of years (e.g., 5 years back, 2 years forward)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 8 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="period-selector">
      <IconButton 
        icon="ArrowLeft" 
        onClick={handlePrevMonth} 
        aria-label="Previous Month"
        variant="ghost"
      />
      
      <div className="period-dropdowns">
        <select 
          className="period-select"
          value={month}
          onChange={(e) => onMonthChange(Number(e.target.value))}
        >
          {MONTHS.map((m, index) => (
            <option key={m} value={index + 1}>{m}</option>
          ))}
        </select>

        <select 
          className="period-select"
          value={year}
          onChange={(e) => onYearChange(Number(e.target.value))}
        >
          {years.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <IconButton 
        icon="ArrowRight" 
        onClick={handleNextMonth} 
        aria-label="Next Month"
        variant="ghost"
      />
    </div>
  );
}

PeriodSelector.propTypes = {
  month: PropTypes.number.isRequired,
  year: PropTypes.number.isRequired,
  onMonthChange: PropTypes.func.isRequired,
  onYearChange: PropTypes.func.isRequired,
};
