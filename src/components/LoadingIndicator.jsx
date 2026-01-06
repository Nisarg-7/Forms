const LoadingIndicator = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="loading">
      <div className="spinner" />
      <p>Loading...</p>
    </div>
  );
};

export default LoadingIndicator;
