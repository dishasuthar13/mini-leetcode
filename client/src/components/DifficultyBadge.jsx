const styles = {
  Easy: 'bg-green-50 text-green-700 border border-green-200',
  Medium: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  Hard: 'bg-red-50 text-red-700 border border-red-200',
};

const DifficultyBadge = ({ difficulty, size = 'sm' }) => (
  <span className={`inline-flex items-center font-semibold rounded-full px-2.5 py-0.5 text-${size} ${styles[difficulty] || 'bg-gray-100 text-gray-600'}`}>
    {difficulty}
  </span>
);

export default DifficultyBadge;