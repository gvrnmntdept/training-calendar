import type { ReactNode } from 'react';

type RuleProps = {
  number: string;
  icon: ReactNode;
  title: string;
  children: ReactNode;
};

export default function Rule({ number, icon, title, children }: RuleProps) {
  return (
    <article className="relative min-w-0 bg-white p-6 sm:min-h-72 lg:min-h-0 xl:min-h-72">
      <span className="font-display absolute top-5 right-5 text-xs font-semibold text-stone-600">{number}</span>
      <div className="mb-12 grid size-11 place-items-center bg-stone-950 text-lime-300">{icon}</div>
      <h3 className="font-display mb-3 text-xl font-semibold uppercase">{title}</h3>
      <p className="m-0 text-sm leading-6 text-stone-500">{children}</p>
    </article>
  );
}
