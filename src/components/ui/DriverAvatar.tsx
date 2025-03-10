'use client';

interface DriverAvatarProps {
  name: string;
  size?: number;
  className?: string;
}

export default function DriverAvatar({ name, size = 48, className = '' }: DriverAvatarProps) {
  // Get initials from name
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  // Generate a consistent color based on name
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-purple-500',
    'bg-indigo-500'
  ];
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  const bgColor = colors[colorIndex];

  return (
    <div
      className={`flex items-center justify-center rounded-full text-white font-semibold ${bgColor} ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  );
} 