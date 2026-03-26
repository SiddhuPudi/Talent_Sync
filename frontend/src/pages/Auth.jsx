import { useState } from "react";
import { loginUser, registerUser } from "../features/auth/authService";
import { useAuth } from "../store/AuthContext";

function Auth() {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(null); // { text, type }
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
    setMessage(null);
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
      setMessage({ text: "Success! Redirecting...", type: "success" });
    } catch (err) {
      console.log(err);
      setMessage({ 
        text: err?.response?.data?.message || "Something went wrong. Please try again.", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };
  
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setMessage(null);
    setForm({ name: "", email: "", password: "" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg relative overflow-hidden font-sans px-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] bg-primary/15 rounded-full blur-[120px] pointer-events-none animate-pulse-soft"></div>
        <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] pointer-events-none animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] bg-primaryHover/5 rounded-full blur-[100px] pointer-events-none"></div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="card w-full max-w-sm flex flex-col gap-5 z-10 animate-slide-up border-white/10 shadow-2xl"
      >
        <div className="text-center mb-2">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-2xl mx-auto mb-4">
                🚀
            </div>
            <h2 className="text-3xl font-bold gradient-text pb-1">
                Talent Sync
            </h2>
            <p className="text-textSoft text-sm mt-2">
                {isLogin ? "Welcome back! Sign in to continue." : "Create an account to get started."}
            </p>
        </div>

        {/* Inline message */}
        {message && (
          <div className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 animate-scale-in ${
            message.type === "success" 
              ? "bg-green-500/10 border border-green-500/20 text-green-400" 
              : "bg-red-500/10 border border-red-500/20 text-red-400"
          }`}>
            <span>{message.type === "success" ? "✅" : "⚠️"}</span>
            {message.text}
          </div>
        )}

        {!isLogin && (
          <div>
            <label className="block text-xs font-medium text-textSoft mb-1.5 uppercase tracking-wider">Full Name</label>
            <input
              name="name"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-textSoft mb-1.5 uppercase tracking-wider">Email</label>
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-textSoft mb-1.5 uppercase tracking-wider">Password</label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className="input-field pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-textSoft/60 hover:text-textSoft text-sm transition-colors"
              tabIndex={-1}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>
        
        <button
          type="submit"
          className="btn-primary w-full mt-2"
          disabled={loading}
        >
          {loading ? (
             <span className="flex items-center gap-2">
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                 {isLogin ? "Signing in..." : "Creating account..."}
             </span>
          ) : (
             isLogin ? "Sign In" : "Create Account"
          )}
        </button>
        
        <div className="relative flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="text-xs text-textSoft/50">OR</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        <p
          onClick={toggleMode}
          className="text-textSoft text-sm cursor-pointer text-center hover:text-textMain transition-colors"
        >
          {isLogin
            ? "Don't have an account? "
            : "Already have an account? "}
          <span className="text-primaryHover font-semibold hover:underline">
            {isLogin ? "Register" : "Login"}
          </span>
        </p>
      </form>
    </div>
  );
}

export default Auth;