interface Props {
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: Props) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-3xl border border-line bg-surface px-6 py-12 text-center"
    >
      <p className="text-sm font-medium text-ink">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-full border border-line px-4 py-2 text-sm font-medium hover:bg-swatch focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Try again
        </button>
      )}
    </div>
  );
}
