type Props = {
  icon: string;
  title: string;
  text: string;
};

export function InfoCard({ icon, title, text }: Props) {
  return (
    <div className="shadow-card rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start gap-3">
        <span className="text-2xl" aria-hidden>
          {icon}
        </span>
        <div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{text}</p>
        </div>
      </div>
    </div>
  );
}
