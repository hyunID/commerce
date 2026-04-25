import { login } from "./api/auth";

function App() {
  const handleLogin = async () => {
    try {
      const res = await login("test@test.com");
      console.log("로그인 결과:", res);
    } catch (err) {
      console.error(err);
    }
  };

  return (
      <div>
        <h1>Commerce Web</h1>

        <button onClick={handleLogin}>
          로그인 테스트
        </button>
      </div>
  );
}

export default App;