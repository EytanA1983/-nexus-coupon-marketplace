export default function ErrorMessage({ message, onDismiss }: { message: string; onDismiss?: () => void }) {
  return (
    <div className="alert alert-error">
      <span>{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="alert-close">
          ×
        </button>
      )}
    </div>
  );
}
