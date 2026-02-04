type LoginProps = {
  password: string;
  error: string;
  setPassword: (v: string) => void;
  handleLogin: () => void;
};

function Login({ password, error, setPassword, handleLogin }: LoginProps) {
  return (
    <div className="login">
      <div className="login-box">
        <img src="/jujo.jpg" alt="Logo" className="login-logo" />
        <div style={{ textAlign: "center", marginBottom: 10, color: "#007bff", fontWeight: 500 }}>
          Login for 24 hours updated news
        </div>
        <h2>Enter Passcode</h2>
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button onClick={handleLogin}>Enter</button>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}

export default Login;
