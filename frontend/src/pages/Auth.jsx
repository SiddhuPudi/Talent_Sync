import { useState } from "react";
import { loginUser, registerUser } from "../features/auth/authService";
import { useAuth } from "../store/AuthContext";

function Auth() {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let data;
      if (isLogin) {
        data = await loginUser({
          email: form.email,
          password: form.password,
        });
      } else {
        data = await registerUser(form);
      }
      login(data.token);
      alert("Success 🚀");
    } catch (err) {
      console.log(err);
      alert("Error occurred");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg relative overflow-hidden font-sans">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-accent/10 rounded-full blur-[100px] pointer-events-none"></div>

      <form
        onSubmit={handleSubmit}
        className="card w-full max-w-sm flex flex-col gap-5 z-10 animate-slide-up"
      >
        <div className="text-center mb-2">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primaryHover to-accent pb-1">
                Talent Sync
            </h2>
            <p className="text-textSoft text-sm mt-1">
                {isLogin ? "Welcome back! Login to continue." : "Create an account to join."}
            </p>
        </div>

        {!isLogin && (
          <input
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            className="input-field"
            required
          />
        )}
        <input
          name="email"
          type="email"
          placeholder="Email Address"
          onChange={handleChange}
          className="input-field"
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          className="input-field"
          required
        />
        
        <button
          type="submit"
          className="btn-primary w-full mt-2"
          disabled={loading}
        >
          {loading ? (
             <span className="flex items-center gap-2">
                 <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                 Processing...
             </span>
          ) : (
             isLogin ? "Login" : "Register"
          )}
        </button>
        
        <p
          onClick={() => setIsLogin(!isLogin)}
          className="text-textSoft text-sm cursor-pointer text-center hover:text-textMain transition-colors mt-2"
        >
          {isLogin
            ? "Don't have an account? Register"
            : "Already have an account? Login"}
        </p>
      </form>
    </div>
  );
}

export default Auth;