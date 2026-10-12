// Profile picture, or the first letter of the username on an accent tile.
export function Avatar({ user, src, size = 24, className = "" }) {
  const image = src !== undefined ? src : user?.avatar;
  const style = { width: size, height: size };
  if (image) {
    return <img src={image} alt="" style={style} className={`shrink-0 rounded-md object-cover ${className}`} />;
  }
  return (
    <span
      style={{ ...style, fontSize: Math.max(10, size * 0.42) }}
      className={`flex shrink-0 items-center justify-center rounded-md bg-btn font-mono font-medium text-btn-ink ${className}`}
    >
      {(user?.username || "?").charAt(0).toUpperCase()}
    </span>
  );
}
