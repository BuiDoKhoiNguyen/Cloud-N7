import { useState } from "react";
import { Form, Input, Button, Upload } from "antd";
import { MdEmail, MdPerson, MdPhoneIphone } from "react-icons/md";
import { IoIosLock } from "react-icons/io";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useQueryClient } from "react-query";
import api from "../services/api";

export default function Register() {
  const [form] = Form.useForm();
  const [image, setImage] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleRegister = (values) => {
    if (values.password !== values.repeatPassword) {
      return toast("Mật khẩu không khớp", { type: "warning" });
    }

    const formData = new FormData();
    formData.append("phoneNumber", values.phoneNumber);
    formData.append("email", values.email);
    formData.append("password", values.password);
    formData.append("firstName", values.firstName);
    formData.append("lastName", values.lastName);
    if (image) formData.append("avatar", image);

    api
      .create(formData)
      .then(() => {
        queryClient.invalidateQueries(["users"]);
        navigate("/login");
      })
      .catch((err) => toast(err.message, { type: "error" }));
  };

  return (
    <Form
      layout="vertical"
      form={form}
      onFinish={handleRegister}
      className="max-w-md mx-auto p-5"
    >
      <h2 className="text-4xl font-bold text-center mb-4">Sign Up</h2>
      <p className="text-center mb-6">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-500">
          Sign in here
        </Link>
      </p>

      <Form.Item
        name="phoneNumber"
        rules={[{ required: true, message: "Please input your phone number!" }]}
      >
        <Input placeholder="Your phone number" prefix={<MdPhoneIphone />} />
      </Form.Item>

      <Form.Item
        name="email"
        rules={[
          { required: true, message: "Please input your email!" },
          { type: "email", message: "Invalid email format!" },
        ]}
      >
        <Input placeholder="Your email" prefix={<MdEmail />} />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[{ required: true, message: "Please input your password!" }]}
      >
        <Input.Password placeholder="Your password" prefix={<IoIosLock />} />
      </Form.Item>

      <Form.Item
        name="repeatPassword"
        rules={[{ required: true, message: "Please repeat your password!" }]}
      >
        <Input.Password placeholder="Repeat password" prefix={<IoIosLock />} />
      </Form.Item>

      <Form.Item
        name="firstName"
        rules={[{ required: true, message: "Please input your first name!" }]}
      >
        <Input placeholder="Your first name" prefix={<MdPerson />} />
      </Form.Item>

      <Form.Item
        name="lastName"
        rules={[{ required: true, message: "Please input your last name!" }]}
      >
        <Input placeholder="Your last name" prefix={<MdPerson />} />
      </Form.Item>

      {image && (
        <img
          src={URL.createObjectURL(image)}
          alt="Avatar preview"
          className="w-40 h-40 object-cover rounded-full mx-auto mb-4"
        />
      )}

      <Form.Item label="Avatar">
        <Upload
          accept="image/*"
          maxCount={1}
          beforeUpload={(file) => {
            setImage(file);
            return false; // prevent automatic upload
          }}
        >
          <Button>Upload Avatar</Button>
        </Upload>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          Tạo mới
        </Button>
      </Form.Item>
    </Form>
  );
}
