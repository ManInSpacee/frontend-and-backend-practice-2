export default function Home() {
  return (
    <div>
      <h1>Главная страница</h1>
      <p>
        Это основной маршрут. Компонент <code>About</code> в бандл главной
        страницы не попал — он загрузится только при переходе на /about.
      </p>
    </div>
  );
}
