import { Button, Card, Form, Input, Select, message } from 'antd';
import { useAuthStore } from '../store/useAuth';
import { useNavigate } from 'react-router-dom';
import { Role } from '../types/hotel';

const { Option } = Select;

const Register = () => {
  const { register } = useAuthStore();
  const navigate = useNavigate();

  const onFinish = (values: { username: string; password: string; role: Role }) => {
    const success = register(values.username, values.password, values.role);
    if (success) {
      message.success('注册成功，请登录');
      navigate('/login');
    } else {
      message.error('用户名已存在');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <Card title="注册" style={{ width: 400 }}>
        <Form onFinish={onFinish}>
          <Form.Item name="username" rules={[{ required: true }]}><Input placeholder="用户名" /></Form.Item>
          <Form.Item name="password" rules={[{ required: true }]}><Input.Password placeholder="密码" /></Form.Item>
          <Form.Item name="role" rules={[{ required: true }]}>
            <Select placeholder="选择角色">
              <Option value="merchant">商户</Option>
              <Option value="admin">管理员</Option>
            </Select>
          </Form.Item>
          <Button type="primary" htmlType="submit" block>注册</Button>
          <Button type="link" onClick={() => navigate('/login')}>已有账号？去登录</Button>
        </Form>
      </Card>
    </div>
  );
};

export default Register;