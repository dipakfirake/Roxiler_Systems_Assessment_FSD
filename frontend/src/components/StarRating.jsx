import { useState } from 'react';

export default function StarRating({ value = 0, onChange, readonly = false }) {
  const [hoverValue, setHoverValue] = useState(0);

  const handleClick = (rating) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating) => {
    if (!readonly) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverValue(0);
    }
  };

  const displayValue = hoverValue || value;

  return (
    <div className="star-rating" onMouseLeave={handleMouseLeave}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= displayValue;
        const isHovered = hoverValue > 0 && star <= hoverValue;

        return (
          <span
            key={star}
            className={`star-rating-star ${isFilled ? 'filled' : ''} ${
              !readonly ? 'interactive' : ''
            } ${isHovered && !readonly ? 'hovered' : ''}`}
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            role={!readonly ? 'button' : undefined}
            tabIndex={!readonly ? 0 : undefined}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleClick(star);
              }
            }}
          >
            {isFilled ? '★' : '☆'}
          </span>
        );
      })}
      {value > 0 && readonly && (
        <span className="star-rating-value">{Number(value).toFixed(1)}</span>
      )}
    </div>
  );
}
