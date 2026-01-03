import AddProduct from './pages/AddProduct';
import AdminBanners from './pages/AdminBanners';
import AdminCampaigns from './pages/AdminCampaigns';
import AdminPanel from './pages/AdminPanel';
import Dashboard from './pages/Dashboard';
import DebugProducts from './pages/DebugProducts';
import Demo from './pages/Demo';
import Home from './pages/Home';
import ProductPage from './pages/ProductPage';
import ProfileSetup from './pages/ProfileSetup';
import SellerCampaigns from './pages/SellerCampaigns';
import Shop from './pages/Shop';
import ShopPage from './pages/ShopPage';
import SubscriptionExpired from './pages/SubscriptionExpired';
import SubscriptionRequest from './pages/SubscriptionRequest';
import TikTokGuide from './pages/TikTokGuide';
import TikTokGuidePublic from './pages/TikTokGuidePublic';
import AllShops from './pages/AllShops';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AddProduct": AddProduct,
    "AdminBanners": AdminBanners,
    "AdminCampaigns": AdminCampaigns,
    "AdminPanel": AdminPanel,
    "Dashboard": Dashboard,
    "DebugProducts": DebugProducts,
    "Demo": Demo,
    "Home": Home,
    "ProductPage": ProductPage,
    "ProfileSetup": ProfileSetup,
    "SellerCampaigns": SellerCampaigns,
    "Shop": Shop,
    "ShopPage": ShopPage,
    "SubscriptionExpired": SubscriptionExpired,
    "SubscriptionRequest": SubscriptionRequest,
    "TikTokGuide": TikTokGuide,
    "TikTokGuidePublic": TikTokGuidePublic,
    "AllShops": AllShops,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};