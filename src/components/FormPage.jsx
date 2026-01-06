const FormPage = ({
  question,
  answer,
  onAnswerChange,
  onBlur,
  onNext,
  onPrev,
  onSubmit,
  isFirstPage,
  isLastPage
}) => {
  return (
    <>
      <h2>{question.text}</h2>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="form-group">
          <label htmlFor={question.id}>Your Answer:</label>
          <textarea
            id={question.id}
            placeholder="Enter your answer..."
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            onBlur={onBlur}
            required
          />
        </div>

        <div className="button-group">
          <button
            type="button"
            className="btn-prev"
            onClick={onPrev}
            disabled={isFirstPage}
          >
            Previous
          </button>
          {!isLastPage ? (
            <button
              type="button"
              className="btn-next"
              onClick={onNext}
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              className="btn-submit"
              onClick={onSubmit}
            >
              Submit
            </button>
          )}
        </div>
      </form>
    </>
  );
};

export default FormPage;
