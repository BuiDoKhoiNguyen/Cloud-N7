import { useUser } from "@/hooks/user";
import { Checkbox, Form, Button, Input } from "antd";
import { IoIosLock } from "react-icons/io";
import { MdEmail } from "react-icons/md";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";

export default function Login() {
  const { setUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();

  const handleLogin = async (values) => {
    try {
      const user = await api.login(values);
      setUser(user);
      navigate(location.state?.url || "/");
    } catch (err) {
      toast(err.message, { type: "error" });
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleLogin}
      className="max-w-md mx-auto p-6"
    >
      <h2 className="text-4xl font-bold text-center mb-4">Sign In</h2>

      <div className="text-center mb-6">
        Don't have an account?{" "}
        <Link to="/register" className="text-primary">
          Click here to sign up
        </Link>
      </div>

      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: "Please input your email!" },
          { type: "email", message: "Invalid email address!" },
        ]}
      >
        <Input placeholder="Your email" prefix={<MdEmail />} type="email" />
      </Form.Item>

      <Form.Item
        name="password"
        label="Password"
        rules={[{ required: true, message: "Please input your password!" }]}
      >
        <Input.Password placeholder="Your password" prefix={<IoIosLock />} />
      </Form.Item>

      <div className="flex justify-between items-center mb-4">
        <Form.Item name="remember" valuePropName="checked" noStyle>
          <Checkbox>Remember me</Checkbox>
        </Form.Item>

        <Link to="/forgot-password">Forgot password?</Link>
      </div>

      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          Đăng Nhập
        </Button>
      </Form.Item>
    </Form>
  );
}
