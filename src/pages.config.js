import AddProduct from './pages/AddProduct';
import AdminBanners from './pages/AdminBanners';
import AdminCampaigns from './pages/AdminCampaigns';
import AdminPanel from './pages/AdminPanel';
import AllShops from './pages/AllShops';
import Campagnes from './pages/Campagnes';
import Campaigns from './pages/Campaigns';
import CouponRedeem from './pages/CouponRedeem';
import Dashboard from './pages/Dashboard';
import DebugProducts from './pages/DebugProducts';
import Demo from './pages/Demo';
import DevenirVendeur from './pages/DevenirVendeur';
import Home from './pages/Home';
import ProductPage from './pages/ProductPage';
import ProfileSetup from './pages/ProfileSetup';
import PromotionProduct from './pages/PromotionProduct';
import SellerCampaigns from './pages/SellerCampaigns';
import Shop from './pages/Shop';
import ShopPage from './pages/ShopPage';
import SubscriptionExpired from './pages/SubscriptionExpired';
import SubscriptionRequest from './pages/SubscriptionRequest';
import TikTokGuide from './pages/TikTokGuide';
import TikTokGuidePublic from './pages/TikTokGuidePublic';
import RecentActivity from './pages/RecentActivity';
import GrowthTips from './pages/GrowthTips';
import ActivityDetail from './pages/ActivityDetail';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AddProduct": AddProduct,
    "AdminBanners": AdminBanners,
    "AdminCampaigns": AdminCampaigns,
    "AdminPanel": AdminPanel,
    "AllShops": AllShops,
    "Campagnes": Campagnes,
    "Campaigns": Campaigns,
    "CouponRedeem": CouponRedeem,
    "Dashboard": Dashboard,
    "DebugProducts": DebugProducts,
    "Demo": Demo,
    "DevenirVendeur": DevenirVendeur,
    "Home": Home,
    "ProductPage": ProductPage,
    "ProfileSetup": ProfileSetup,
    "PromotionProduct": PromotionProduct,
    "SellerCampaigns": SellerCampaigns,
    "Shop": Shop,
    "ShopPage": ShopPage,
    "SubscriptionExpired": SubscriptionExpired,
    "SubscriptionRequest": SubscriptionRequest,
    "TikTokGuide": TikTokGuide,
    "TikTokGuidePublic": TikTokGuidePublic,
    "RecentActivity": RecentActivity,
    "GrowthTips": GrowthTips,
    "ActivityDetail": ActivityDetail,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};