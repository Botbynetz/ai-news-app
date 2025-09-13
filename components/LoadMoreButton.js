export default function LoadMoreButton({ onClick, disabled }) {
  return (
    <div className="flex justify-center mt-6">
      <button onClick={onClick} disabled={disabled} className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 disabled:opacity-50">
        Load More
      </button>
    </div>
  );
}
