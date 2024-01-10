import React from 'react';

const Tags = ({ tags }) => {
  return (
    <div>
      {tags.map((tag, index) => (
        <span key={index} className="tag">
          {tag}
        </span>
      ))}
    </div>
  );
};

export default Tags;