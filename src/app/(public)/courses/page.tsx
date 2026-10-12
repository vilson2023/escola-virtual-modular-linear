import { Container } from '@/components/ui/Container';
import { getCourseCards } from '@/server/services/catalog';
import { CourseCard } from '@/components/course/CourseCard';

export const metadata = { title: 'Todos os cursos' };

type Props = {
  searchParams: Promise<{ q?: string; categoria?: string }>;
};

export default async function CoursesPage({ searchParams }: Props) {
  const { q, categoria } = await searchParams;
  const query = (q ?? '').trim().toLowerCase();
  const category = (categoria ?? '').trim();

  const all = await getCourseCards();
  const courses = all.filter((c) => {
    if (category && c.category !== category) return false;
    if (
      query &&
      !(
        c.title.toLowerCase().includes(query) ||
        (c.shortDescription ?? '').toLowerCase().includes(query) ||
        (c.description ?? '').toLowerCase().includes(query) ||
        (c.category ?? '').toLowerCase().includes(query)
      )
    )
      return false;
    return true;
  });

  return (
    <main>
      <section className="border-b border-slate-200 bg-white">
        <Container className="py-10">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Todos os cursos</h1>
          {(query || category) && (
            <p className="mt-2 text-sm text-slate-500">
              {courses.length} resultado{courses.length === 1 ? '' : 's'}
              {category && (
                <>
                  {' '}
                  em <span className="font-semibold text-slate-700">{category}</span>
                </>
              )}
              {query && (
                <>
                  {' '}
                  para <span className="font-semibold text-slate-700">“{q}”</span>
                </>
              )}
            </p>
          )}
        </Container>
      </section>

      <section className="py-12">
        <Container>
          {courses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <p className="text-slate-500">Nenhum curso encontrado.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </Container>
      </section>
    </main>
  );
}
