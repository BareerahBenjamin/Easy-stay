import { Layout, Menu, Button } from 'antd';
import { useAuthStore } from '../../store/useAuth';
import { Outlet, useNavigate } from 'react-router-dom';

const { Header, Content } = Layout;

const AdminLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>易宿 - 管理员后台</div>
        <div>欢迎 {user?.username} <Button type="link" onClick={() => { logout(); navigate('/login'); }}>退出</Button></div>
      </Header>
      <Content style={{ padding: 24 }}>
        <Outlet />
      </Content>
    </Layout>
  );
};

export default AdminLayout;