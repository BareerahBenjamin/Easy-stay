import { Layout, Button } from 'antd';
import { useAuthStore } from '../../store/useAuth';
import { Outlet, useNavigate } from 'react-router-dom';

const { Header, Content } = Layout;

const MerchantLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1890ff' }}>
        <div>易宿酒店管理后台 - 商户端</div>
        <div>
          欢迎，{user?.username}（商户）
          <Button 
            type="link" 
            style={{ color: '#fff' }}
            onClick={() => { 
              logout(); 
              navigate('/login'); 
            }}
          >
            退出登录
          </Button>
        </div>
      </Header>
      <Content style={{ padding: 24, background: '#f0f2f5' }}>
        <Outlet />   {/* 这里会显示 HotelForm */}
      </Content>
    </Layout>
  );
};

export default MerchantLayout;