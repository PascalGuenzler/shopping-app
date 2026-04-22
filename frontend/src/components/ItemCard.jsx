export default function ItemCard({ item, currentUser, onClaim, onDone, onDelete }) {
  const isOwn = item.created_by_name === currentUser;
  const isClaimedByMe = item.claimed_by_name === currentUser;
  const isDone = item.status === 'done';

  const handleMainAction = async () => {
    if (isDone) return;
    if (isOwn || isClaimedByMe) {
      // Own or claimed → mark done
      await onDone(item.id);
    } else if (item.status === 'open') {
      // Others open item → claim it
      await onClaim(item.id);
    } else if (item.claimed_by_name && !isClaimedByMe) {
      // Already claimed by someone else → can't interact
    }
  };

  const canDelete = isOwn || isClaimedByMe || isDone;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 bg-white rounded-xl border transition-all
        ${isDone ? 'opacity-60 border-gray-100' : 'border-gray-100 active:bg-gray-50'}
      `}
    >
      {/* Checkbox button */}
      <button
        onClick={handleMainAction}
        disabled={isDone || (!isOwn && !isClaimedByMe && item.status === 'claimed' && !isClaimedByMe)}
        className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all
          ${isDone
            ? 'bg-green-500 border-green-500 text-white'
            : isClaimedByMe
            ? 'border-green-500 bg-green-50 text-green-600'
            : isOwn
            ? 'border-blue-400 bg-blue-50'
            : item.status === 'claimed'
            ? 'border-orange-300 bg-orange-50'
            : 'border-gray-300 hover:border-green-400'
          }
        `}
      >
        {isDone && (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
        {isClaimedByMe && !isDone && (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Text */}
      <div className="flex-1 min-w-0" onClick={handleMainAction}>
        <div className={`font-medium text-gray-800 truncate ${isDone ? 'line-through text-gray-400' : ''}`}>
          {item.text}
          {item.quantity && (
            <span className="ml-2 text-sm font-normal text-gray-400">({item.quantity})</span>
          )}
        </div>
        <div className="text-xs text-gray-400 mt-0.5">
          {isOwn ? 'von mir' : `von ${item.created_by_name}`}
          {item.claimed_by_name && !isDone && (
            <span className={`ml-2 font-medium ${isClaimedByMe ? 'text-green-600' : 'text-orange-500'}`}>
              • {isClaimedByMe ? 'ich bringe es' : `${item.claimed_by_name} bringt es`}
            </span>
          )}
        </div>
      </div>

      {/* Action hint for unclaimed items from others */}
      {!isOwn && !isClaimedByMe && item.status === 'open' && !isDone && (
        <button
          onClick={handleMainAction}
          className="flex-shrink-0 text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-lg whitespace-nowrap"
        >
          Ich bring's
        </button>
      )}

      {/* Unclaim button for claimed items */}
      {isClaimedByMe && !isOwn && !isDone && (
        <button
          onClick={() => onClaim(item.id)}
          className="flex-shrink-0 text-xs text-gray-400 hover:text-red-400 px-2"
          title="Claim aufheben"
        >
          ✕
        </button>
      )}

      {/* Delete button */}
      {canDelete && (
        <button
          onClick={() => onDelete(item.id)}
          className="flex-shrink-0 text-gray-300 hover:text-red-400 transition-colors p-1"
          title="Löschen"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  );
}
