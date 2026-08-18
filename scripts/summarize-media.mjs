import data from '../client/src/data/curriculum.json' with { type: 'json' };
const isEmbeddable = (url = '') => /youtube-nocookie\.com\/embed|youtube\.com\/embed|\.(mp4|webm|ogg)(\?|$)/i.test(url);
for (const course of data.courses) {
  const lessons = course.phases.flatMap((phase) => phase.lessons);
  const embeddable = lessons.filter((lesson) => lesson.video && isEmbeddable(lesson.video));
  const hubOrOther = lessons.filter((lesson) => lesson.video && !isEmbeddable(lesson.video));
  const missing = lessons.filter((lesson) => !lesson.video);
  console.log(`${course.id} lessons=${lessons.length} embeddable=${embeddable.length} hubOrOther=${hubOrOther.length} missing=${missing.length}`);
}
