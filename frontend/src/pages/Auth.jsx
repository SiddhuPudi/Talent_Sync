import { useState, useMemo } from "react";
import { loginUser, registerUser, verifyOtp } from "../features/auth/authService";
import { useAuth } from "../store/AuthContext";

function Auth() {
  const { login } = useAuth();
  const [step, setStep] = useState("auth"); // 'auth' or 'otp'
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(null); // { text, type }
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [otpCode, setOtpCode] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const isEmailValid = form.email === "" || form.email.endsWith("@gmail.com");
  const pwd = form.password;
  const pwdMinLength = pwd.length >= 8;
  const pwdHasLetter = /[A-Za-z]/.test(pwd);
  const pwdHasNumber = /\d/.test(pwd);
  const isPasswordValid = pwd === "" || (pwdMinLength && pwdHasLetter && pwdHasNumber);

  // Disable if fields are missing or validations fail
  const isFormValid = useMemo(() => {
    if (!form.email || !form.email.endsWith("@gmail.com")) return false;
    if (!form.password || !pwdMinLength || !pwdHasLetter || !pwdHasNumber) return false;
    if (!isLogin && !form.name.trim()) return false;
    return true;
  }, [form, isLogin, pwdMinLength, pwdHasLetter, pwdHasNumber]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
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
      
      if (data.step === "otp") {
        setStep("otp");
        setMessage({ text: "OTP sent successfully to your email.", type: "success" });
      } else if (data.token) {
        // Fallback in case backend returns token directly
        login(data.token);
        setMessage({ text: "Success! Redirecting...", type: "success" });
      }
    } catch (err) {
      console.log(err);
      setMessage({ 
        text: err?.response?.data?.message || "Invalid email or password", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) return;
    setLoading(true);
    setMessage(null);
    try {
      const data = await verifyOtp({
        email: form.email,
        otp: otpCode,
      });
      login(data.token);
      setMessage({ text: "Success! Redirecting...", type: "success" });
    } catch (err) {
      console.log(err);
      setMessage({ 
        text: err?.response?.data?.message || "Incorrect OTP", 
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

      <div className="card w-full max-w-sm flex flex-col gap-5 z-10 animate-slide-up border-white/10 shadow-2xl">
        <div className="text-center mb-2">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-2xl mx-auto mb-4">
                {step === 'otp' ? "🔐" : "🚀"}
            </div>
            <h2 className="text-3xl font-bold gradient-text pb-1">
                {step === 'otp' ? "Verification" : "Talent Sync"}
            </h2>
            <p className="text-textSoft text-sm mt-2">
                {step === 'otp' 
                   ? "Enter the 6-digit code sent to your email." 
                   : isLogin ? "Welcome back! Sign in to continue." : "Create an account to get started."}
            </p>
        </div>

        {/* Inline message */}
        {message && (
          <div className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 animate-scale-in ${
            message.type === "success" 
              ? "bg-green-500/10 border border-green-500/20 text-green-400" 
              : "bg-red-500/10 border border-red-500/20 text-red-500"
          }`}>
            <span>{message.type === "success" ? "✅" : "⚠️"}</span>
            {message.text}
          </div>
        )}

        {step === 'auth' ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
                placeholder="you@gmail.com"
                value={form.email}
                onChange={handleChange}
                className="input-field"
                required
              />
              {!isEmailValid && (
                <p className="text-red-500 text-xs mt-1 animate-fadeIn">Only @gmail.com accounts are allowed</p>
              )}
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
              {/* Real-time Validation rules */}
              {(!isLogin || pwd.length > 0) && (
                <div className="text-xs mt-2 flex flex-col gap-1">
                  <span className={pwdMinLength ? "text-green-400" : "text-red-500"}>
                    {pwdMinLength ? "✓" : "×"} Minimum 8 characters
                  </span>
                  <span className={pwdHasLetter ? "text-green-400" : "text-red-500"}>
                    {pwdHasLetter ? "✓" : "×"} Must include letter
                  </span>
                  <span className={pwdHasNumber ? "text-green-400" : "text-red-500"}>
                    {pwdHasNumber ? "✓" : "×"} Must include number
                  </span>
                </div>
              )}
            </div>
            
            <button
              type="submit"
              className={`btn-primary w-full mt-2 ${!isFormValid ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading || !isFormValid}
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
        ) : (
          <form onSubmit={handleOtpSubmit} className="flex flex-col gap-5 animate-slide-up">
            <div>
              <label className="block text-xs font-medium text-textSoft mb-1.5 uppercase tracking-wider text-center">6-Digit Code</label>
              <input
                name="otpCode"
                type="text"
                maxLength="6"
                placeholder="000000"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="input-field text-center text-2xl tracking-widest font-mono"
                required
              />
            </div>
            <button
              type="submit"
              className="btn-primary w-full mt-2"
              disabled={loading || otpCode.length < 6}
            >
              {loading ? (
                 <span className="flex items-center justify-center gap-2">
                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                     Verifying...
                 </span>
              ) : (
                 "Verify OTP"
              )}
            </button>
            <p
              onClick={() => setStep('auth')}
              className="text-textSoft text-sm cursor-pointer text-center hover:text-textMain transition-colors mt-2"
            >
              Cancel and go back
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default Auth;