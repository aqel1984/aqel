interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
}

export function StatsCard({ title, value, description, trend }: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex flex-col">
        <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
        <dd className="mt-1 text-3xl font-semibold text-gray-900">{value}</dd>
        
        {description && (
          <p className="mt-2 text-sm text-gray-500">{description}</p>
        )}
        
        {trend && (
          <div className="mt-2">
            <span
              className={`inline-flex items-center text-sm font-medium ${
                trend.positive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend.positive ? '↑' : '↓'} {trend.value}%
              <span className="ml-1 text-gray-500">{trend.label}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
