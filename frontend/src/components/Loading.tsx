export default function Loading({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="loading">
      <div className="loading-icon">⏳</div>
      <div className="loading-text">{message}</div>
    </div>
  );
}
