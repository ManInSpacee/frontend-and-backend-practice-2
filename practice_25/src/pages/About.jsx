const bigList = Array.from({ length: 500 }, (_, i) => `Пункт #${i + 1}`);

export default function About() {
  return (
    <div>
      <h1>О нас</h1>
      <p>Эта страница загружена через lazy loading — отдельным чанком.</p>
      <ul>
        {bigList.slice(0, 500).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
