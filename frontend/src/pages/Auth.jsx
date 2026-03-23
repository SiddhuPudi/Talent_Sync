import { useState } from "react";
import { loginUser, registerUser } from "../features/auth/authService";
import { useAuth } from "../store/AuthContext";

function Auth() {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
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
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-surface p-8 rounded-xl shadow-lg w-96 flex flex-col gap-4"
      >
        <h2 className="text-2xl text-accent text-center">
          {isLogin ? "Login" : "Register"}
        </h2>
        {!isLogin && (
          <input
            name="name"
            placeholder="Name"
            onChange={handleChange}
            className="p-2 rounded bg-bg text-textMain outline-none"
          />
        )}
        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="p-2 rounded bg-bg text-textMain outline-none"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          className="p-2 rounded bg-bg text-textMain outline-none"
        />
        <button
          type="submit"
          className="bg-primary hover:bg-primaryHover p-2 rounded text-white"
        >
          {isLogin ? "Login" : "Register"}
        </button>
        <p
          onClick={() => setIsLogin(!isLogin)}
          className="text-textSoft text-sm cursor-pointer text-center"
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