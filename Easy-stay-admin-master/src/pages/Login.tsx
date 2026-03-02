import { Button, Card, Form, Input, message } from 'antd';
import { useAuthStore } from '../store/useAuth';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const onFinish = async (values: { username: string; password: string }) => {
    const success = await login(values.username, values.password);
    if (success) {
      message.success('登录成功');
      const user = useAuthStore.getState().user;
      navigate(user?.role === 'admin' ? '/admin' : '/merchant');
    } else {
      message.error('用户名或密码错误');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <Card title="易宿酒店管理后台 - 登录" style={{ width: 400 }}>
        <Form onFinish={onFinish}>
          <Form.Item name="username" rules={[{ required: true }]}><Input placeholder="用户名" /></Form.Item>
          <Form.Item name="password" rules={[{ required: true }]}><Input.Password placeholder="密码" /></Form.Item>
          <Button type="primary" htmlType="submit" block>登录</Button>
          <Button type="link" onClick={() => navigate('/register')}>没有账号？去注册</Button>
        </Form>
      </Card>
    </div>
  );
};

export default Login;